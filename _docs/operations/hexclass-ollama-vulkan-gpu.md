# hexclass — Ollama on Intel Arc Pro B60 via Vulkan

> How the Dr. Hex orchestrator's local LLM inference runs on GPU.
> Configured 2026-05-25 during the v1.1 deploy verification.

## Hardware

- **GPU**: Intel Arc Pro B60 Graphics (Battlemage G21), PCI ID `0000:03:00.0`
- **VRAM**: 24 GB GDDR6
- **Kernel driver**: `xe` (Intel Xe driver for Battlemage, in upstream 6.6+)
- **Vulkan**: presented as `PHYSICAL_DEVICE_TYPE_DISCRETE_GPU` via the Intel
  open-source Mesa driver

## Why Vulkan (not CUDA / SYCL / oneAPI)

- Stock ollama does not ship Intel-specific SYCL or oneAPI backends; getting
  those working requires either Intel's IPEX-LLM fork or a custom build.
- Ollama 0.24+ DOES ship an experimental Vulkan backend (`/usr/local/lib/ollama/vulkan`).
- Mesa's `anv` driver presents Intel discrete GPUs through Vulkan with full
  inference support.
- Net: Vulkan backend = zero-rebuild path to GPU acceleration on this box.

## Required system packages

```
sudo apt-get install -y vulkan-tools mesa-vulkan-drivers
```

After install, `vulkaninfo` should list `Intel(R) Arc(tm) Pro B60 Graphics (BMG G21)`
as GPU id 0 with `driverName = Intel open-source Mesa driver`.

## ollama systemd configuration

Drop-in at `/etc/systemd/system/ollama.service.d/vulkan.conf`:

```ini
[Service]
Environment="OLLAMA_VULKAN=1"
Environment="OLLAMA_LLM_LIBRARY=vulkan"
```

`OLLAMA_VULKAN=1` enables the experimental flag (otherwise ollama logs
"experimental Vulkan support disabled" and falls back to CPU).
`OLLAMA_LLM_LIBRARY=vulkan` forces the backend choice (otherwise ollama
auto-detects and may still pick CPU).

Apply:

```
sudo systemctl daemon-reload
sudo systemctl restart ollama
journalctl -u ollama --since "1 minute ago" | grep "inference compute"
```

The log line should read:
```
inference compute id=<uuid> library=Vulkan description="Intel(R) Arc(tm) Pro B60 Graphics (BMG G21)" total="20.9 GiB" available="18.8 GiB"
```

## Performance

| Operation | CPU (pre-GPU) | Vulkan GPU |
|---|---|---|
| qwen2.5:7b, 50-word reply, no tools | ~6-8s | ~6.7s (cold load) / ~2s (warm) |
| qwen2.5:7b, /chat with 4 tools + RAG | **>60s timeout** | ~22s end-to-end |
| llama3.2:3b, 50-word reply | ~3-4s | ~1-2s |

The "off CPU" win on a tool-heavy chat is roughly **3-4x** end-to-end and,
critically, brings the worst case **inside** the orchestrator's 60s httpx
timeout. Before GPU acceleration the multi-iteration tool loop with
qwen2.5:7b on CPU exceeded 60s and 502'd; with Vulkan it lands comfortably.

## Failure modes & rollback

If a future ollama update breaks the Vulkan backend, fall back to CPU by
disabling the drop-in:

```
sudo systemctl revert ollama
sudo systemctl restart ollama
```

The `vulkan.conf` is preserved; remove or rename to permanently disable.

CPU-only fallback works but the orchestrator's qwen2.5:7b path will time
out on tool-heavy chats. Workaround: temporarily switch
`HEX_DEFAULT_MODEL=llama3.2:3b` in the orchestrator unit drop-in, accepting
weaker model responses, until the GPU path is restored.

## Permissions

The ollama service runs as user `ollama` (group `ollama`). It MUST be in
the `render` group to access `/dev/dri/renderD128` (Vulkan device node).
Verify with:

```
groups ollama
# expected: ollama : ollama video render
```

If `render` is missing: `sudo usermod -aG render ollama && sudo systemctl restart ollama`.

## Related

- `_docs/operations/dr-hex-production-stability.md` — drift control + capacity
- `_docs/operations/dr-hex-v1.1-deploy-verification.md` — the deploy that
  motivated this GPU work
- `_tools/hexclass/orchestrator/main.py` — `call_ollama_blocking()` and the
  60s httpx timeout bounded by drhex-q-policy DoS finding
