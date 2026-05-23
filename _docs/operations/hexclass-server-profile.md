# Hexclass Server — Operational Profile

> Live as of 2026-05-23 — moved home from Keiser room 214.
> Hostname: `hexworthclassroom` (alias `hexclass`)
> Owner: f.mora80@gmail.com

## Hardware

| Component | Spec |
|---|---|
| CPU | Intel Core i5-12400F (Alder Lake) — 6 P-cores / 12 threads, 2.5–5.6 GHz, 18 MB L3 |
| RAM | 32 GB DDR4 (31 Gi free at last check; 8 Gi swap configured but unused) |
| GPU | **Intel Arc Pro B60** (PCI `8086:e211`, Battlemage Xe2 generation, 24 GB GDDR6) |
| Primary disk | 953 GB NVMe (`nvme0n1`) — LVM `ubuntu--vg-ubuntu--lv` mounted `/`, 100 GB allocated, **850 GB unallocated** (see "Disk allocation" below) |
| Secondary disk | 232.9 GB SATA `sda` — unallocated/unmounted |
| Network | Gigabit Ethernet on `enp5s0`, LAN IP **192.168.1.160/24** |
| Audio | Alder Lake-S HD + GPU HDMI audio (`8086:e2f7`) |

## Software

| Component | Version / Notes |
|---|---|
| OS | Ubuntu Server 24.04.4 LTS (`noble`) |
| Kernel | 6.17.0-29-generic (HWE) — modern xe driver support |
| GPU driver | `xe` (modern Intel GPU driver, NOT i915) — kernel detects Arc Pro B60 |
| OpenCL ICD | `intel-opencl-icd` 24.39.31294.20 (Sept 2024 — predates Battlemage stable support) |
| Level Zero | `intel-level-zero-gpu` 1.3.29735.27 |
| Docker | installed, 0 containers running |
| Python | python3 (system) |
| Cockpit | `:9090` listening, systemd unit active |

## Network identity

| Path | Target | Status | Use |
|---|---|---|---|
| `ssh hexclass` | direct LAN 192.168.1.160 | ✓ working | Home network (fastest, sub-ms) |
| `ssh hexclass-via-bc1` | Tailscale → bc1 → LAN | ✓ working | Off-network / when LAN unreachable |
| `ssh hexclass-via-bc2` | Tailscale → bc2 → LAN | ✓ working | bc1 fallback |
| hexclass → bc1 ping | 192.168.1.176 | ✓ 0.25 ms LAN | Cross-server work |
| hexclass → bc2 ping | 192.168.1.177 | ✓ responds | Cross-server work |

SSH key on operator laptop: `~/.ssh/id_hexclass` (ed25519). User: `hexclass`. Passwordless sudo via `/etc/sudoers.d/hexclass`.

**Previous IP (now obsolete):** `172.17.64.102` — Keiser KUSTUDENT room 214. `~/.ssh/config` HostName fix landed 2026-05-23.

## What's installed

- Docker + docker compose (no containers yet)
- PlatformIO + esptool (for embedded firmware flashing)
- avahi (mDNS)
- Cockpit web admin (`:9090`)
- HWE kernel 6.17 (manually pinned for xe driver)
- Intel client GPU compute stack (OpenCL ICD, Level Zero, level-zero loader, libigc, libigdgmm)

## What's NOT yet installed (deferred to operator)

### GPU compute runtime — DEFERRED

The Arc Pro B60 (Battlemage) launched Dec 2024 / Jan 2025. The Intel client compute runtime packaged in Ubuntu 24.04's noble channel predates Battlemage stable support. `clinfo -l` returns "Number of platforms: 0" — the OpenCL stack doesn't see the GPU as a compute device.

Three viable paths, all require operator decision:

1. **Intel oneAPI Base Toolkit** — separate side-by-side install of newer DPC++/Level Zero runtime. Larger install (~5 GB) but self-contained.
2. **Docker container with IPEX-LLM bundled** — `intelanalytics/ipex-llm-cpu` or `intel/intel-extension-for-pytorch` containers ship known-good Battlemage runtimes. Clean isolation, no system-package conflicts.
3. **Wait for stable channel** — Intel's `noble client` channel will eventually bump. Months out.

Currently the rolling channel (`noble unified`) has Battlemage packages but they have unmet libigdfcl1 dependencies — installing it broke the dep tree, so we rolled back to `client`.

### Tailscale — DEFERRED

Memory note from prior session: KUSTUDENT WiFi at Keiser blocked Tailscale install. Now home, install should succeed. Not yet attempted — operator decision on whether hexclass should join the tailnet.

### AI model — DEFERRED

`./deploy.sh`-shaped model decision pending. See "Model decision" section below.

## Disk allocation note

The NVMe is 953 GB but LVM only allocated 100 GB to `ubuntu--vg-ubuntu--lv`. **850 GB unallocated** in the volume group. Likely a default installer choice. To use the remaining space:

```bash
# Extend the existing LV (preserves data)
sudo lvextend -L +700G /dev/ubuntu-vg/ubuntu-lv
sudo resize2fs /dev/ubuntu-vg/ubuntu-lv

# OR create a separate LV for AI models (recommended — isolates model files)
sudo lvcreate -L 600G -n ai-models /dev/ubuntu-vg
sudo mkfs.ext4 /dev/ubuntu-vg/ai-models
sudo mkdir /var/lib/ai-models
echo '/dev/ubuntu-vg/ai-models /var/lib/ai-models ext4 defaults 0 2' | sudo tee -a /etc/fstab
sudo mount -a
```

Deferred to operator — disk layout is intent-bearing (separate LV vs extend root).

## Model decision (deferred — Nancy tradeoff)

Hexclass has 24 GB GPU VRAM. Realistic model classes:

| Model | VRAM (q4) | Strengths | Tradeoffs |
|---|---|---|---|
| Llama 3.1 8B | ~5 GB | Mature, broad support, Intel IPEX optimized | Smaller context, less reasoning |
| Llama 3.1 70B (q4) | ~40 GB | Strong reasoning, big context | Won't fit in 24 GB — needs CPU offload or 4-bit GPTQ tricks |
| Qwen 2.5 32B (q4) | ~18 GB | Excellent code + reasoning, fits comfortably | Less Intel-ecosystem-tested |
| Mistral Small 22B | ~13 GB | Fast, code-strong | Older arch |
| Phi-4 14B | ~8 GB | Microsoft's reasoning-focused | Small ecosystem |

**Nancy-grade tradeoff axes:**
1. Inference framework — IPEX-LLM (Intel-native, fastest on Arc) vs ollama (broadest, less Arc-optimized) vs vLLM (production but Intel support is fresher)
2. Single model vs model router (route by query type — fast 8B for chat, big 32B for code)
3. Self-hosted UI — Open WebUI, LibreChat, or platform-integrated chatbot

Operator decision: pick a starting model + framework, then we provision.

## Pending work — sprint references

- **GPU compute runtime install** — pending operator decision (3 paths above)
- **Tailscale install** — pending operator authorization
- **AI model + framework selection** — pending Nancy consult + operator choice
- **Disk LV layout** — pending operator decision
- **ePaper Room 214 reflash** — sprint pending (`project_hexclass_server.md` legacy item; now on home network so PlatformIO mirrors should resolve)

## How to verify the profile is still accurate

```bash
ssh hexclass 'hostname; uname -r; free -h; lspci | grep -i "vga\|display"; ip addr show enp5s0 | grep "inet "; clinfo -l 2>/dev/null; docker ps'
```

If any line diverges from this doc, update both this doc and `~/.claude/projects/-home-eq-ai-content-hexworth-prime/memory/project_hexclass_server.md`.