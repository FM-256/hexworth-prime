"""
tests/load_test.py — Dr. Hex orchestrator load test harness.

Run from hexclass against the LIVE orchestrator on 127.0.0.1:8000. This
is a manual / on-demand capacity test, NOT a CI test. It will pin the
GPU for the duration of the run.

Three test modes
----------------
1. --concurrent N --duration S
     N virtual users each loop tight sending /chat requests for S seconds.
     Each user has a unique uid + a unique conversation_id (uuid4).
     Measures sustained throughput + per-request latency at steady state.

2. --burst N
     N requests fired simultaneously, then we wait for all to land.
     Measures: do any time out? Does the orchestrator 429 us? What's the
     spread of latencies when the GPU is hammered all at once?

3. --ramp start end --duration S
     Linear ramp from `start` to `end` concurrent users over `duration`
     seconds. Each second the harness recalculates how many workers
     should be active. Records per-request timestamp + active-concurrency
     so analysis can see when the wheels start to wobble.

What's measured (per request)
-----------------------------
  - wall_latency_ms      — full client→server→client time (what students feel)
  - server_latency_ms    — server-reported latency_ms from ChatResponse
                            (decomposes network/queuing vs model time)
  - status_code          — HTTP status
  - success              — 200 with non-empty response body
  - ollama_timeout       — server returned 502 with "ollama upstream" message
                            (indicator of GPU contention causing 60s timeout)
  - rate_limited         — 429
  - response_chars       — length of response text (sanity-check the model
                            didn't return a 1-char filler)
  - active_concurrency   — how many workers were running when this request
                            started (set by the orchestrator code, not server-side)
  - sent_at_s            — seconds from test start when request was launched

Warm-up
-------
First N requests (default 1) are fired sequentially BEFORE the timed window
opens. They are recorded under `warmup` and excluded from the main stats so
the model-load penalty doesn't skew p95 for the steady state.

Prompts
-------
Static list of safe curriculum questions. Each request picks one round-robin
so the model doesn't get cache hits on identical input but also doesn't hit
the request_filter regex.

Output
------
  /tmp/loadtest_<mode>_<ts>.json    — structured raw data + summary
  /tmp/loadtest_<mode>_<ts>.md      — operator-facing report

Constraints (from CLAUDE.md / task brief)
-----------------------------------------
- httpx async client only, no other new deps
- Must NOT push load tests through the production tunnel — direct
  localhost only. The script enforces this by failing fast on any
  base URL that isn't 127.0.0.1 / localhost unless --allow-remote is set.
"""
from __future__ import annotations

import argparse
import asyncio
import datetime
import json
import os
import statistics
import sys
import time
import uuid
from typing import Any
from urllib.parse import urlparse

import httpx


# ─── Config ──────────────────────────────────────────────────────────
BASE_URL_DEFAULT = "http://127.0.0.1:8000"
API_KEY_DEFAULT = os.environ.get(
    "HEX_AI_API_KEY",
    "k_dev_359e57bda7bdcac4f621afd170a451672c40ff9308e4c8bf",
)
# Per-request client timeout. Must be > orchestrator's internal ollama
# timeout (60s) + some headroom so we can distinguish a timed-out request
# (server returned an error) from a client-cancelled one. 75s gives 15s
# headroom over the 60s orchestrator ceiling.
HTTP_TIMEOUT_S_DEFAULT = 75.0

# Safe prompt pool — common CS terms. All curriculum-friendly, no
# encoding-bypass / jailbreak shapes that would trip request_filter.
SAFE_PROMPTS = [
    "What is RAM?",
    "What is a compiler?",
    "What is TCP?",
    "What is a hash function?",
    "What is a stack data structure?",
    "What is encryption?",
    "What is a process in an operating system?",
    "What is DNS?",
    "What is recursion?",
    "What is a database index?",
    "What is HTTP?",
    "What is a cache?",
    "What is binary search?",
    "What is a port number?",
    "What is virtual memory?",
    "What is a thread?",
    "What is SSH?",
    "What is JSON?",
    "What is a foreign key?",
    "What is asymmetric encryption?",
]


# ─── HTTP layer ──────────────────────────────────────────────────────
async def one_request(
    client: httpx.AsyncClient,
    base_url: str,
    api_key: str,
    user_uid: str,
    conversation_id: str,
    prompt: str,
    test_start_s: float,
    active_concurrency: int,
) -> dict[str, Any]:
    """Fire one /chat request. Returns a record dict."""
    body = {
        "user_uid": user_uid,
        "message": prompt,
        "house": "code",
        "mission_id": None,
        "role": "student",
        "failed_attempts": 0,
        "hint_used_recently": False,
        "conversation_id": conversation_id,
    }
    headers = {
        "Content-Type": "application/json",
        "X-API-Key": api_key,
    }
    t0 = time.monotonic()
    sent_at_s = round(t0 - test_start_s, 3)
    rec: dict[str, Any] = {
        "user_uid": user_uid,
        "conversation_id": conversation_id,
        "prompt": prompt,
        "sent_at_s": sent_at_s,
        "active_concurrency": active_concurrency,
        "status_code": None,
        "wall_latency_ms": None,
        "server_latency_ms": None,
        "success": False,
        "ollama_timeout": False,
        "rate_limited": False,
        "response_chars": 0,
        "error": None,
    }
    try:
        r = await client.post(
            f"{base_url}/chat",
            json=body,
            headers=headers,
        )
        wall_ms = int((time.monotonic() - t0) * 1000)
        rec["wall_latency_ms"] = wall_ms
        rec["status_code"] = r.status_code
        if r.status_code == 200:
            try:
                data = r.json()
            except Exception as e:
                rec["error"] = f"json_decode: {e}"
                return rec
            rec["server_latency_ms"] = data.get("latency_ms")
            text = data.get("response") or ""
            rec["response_chars"] = len(text)
            rec["success"] = bool(text.strip())
            return rec
        if r.status_code == 429:
            rec["rate_limited"] = True
            rec["error"] = (r.text or "")[:200]
            return rec
        if r.status_code == 502:
            body_text = (r.text or "")[:500]
            rec["error"] = body_text
            # Orchestrator surfaces an ollama upstream failure as
            # `{"detail": "ollama upstream: <err>"}`. When the 60s
            # httpx timeout fires inside call_ollama_blocking, the
            # exception string is often empty (ReadTimeout('')) so the
            # detail comes out as `"ollama upstream: "` with no suffix.
            # Treat ANY 502 with "ollama upstream" + wall time near the
            # 60s ceiling as GPU contention — that's the signal we want.
            low = body_text.lower()
            if "ollama upstream" in low:
                near_ceiling = (
                    rec["wall_latency_ms"] is not None
                    and rec["wall_latency_ms"] >= 55_000
                )
                if "timeout" in low or "timed out" in low or near_ceiling:
                    rec["ollama_timeout"] = True
            return rec
        rec["error"] = (r.text or "")[:200]
        return rec
    except httpx.TimeoutException as e:
        # Client-side timeout — request never returned. The orchestrator
        # may still be working on it; from the student's perspective the
        # request failed.
        rec["wall_latency_ms"] = int((time.monotonic() - t0) * 1000)
        rec["error"] = f"client_timeout: {e}"
        return rec
    except Exception as e:
        rec["wall_latency_ms"] = int((time.monotonic() - t0) * 1000)
        rec["error"] = f"exception: {type(e).__name__}: {e}"
        return rec


# ─── Test modes ──────────────────────────────────────────────────────
async def run_concurrent(
    base_url: str, api_key: str, n_workers: int, duration_s: int,
    prompts: list[str], test_start_s: float, http_timeout_s: float,
) -> list[dict[str, Any]]:
    """N workers, each looping /chat for duration_s seconds.
    Each worker has its own uid + conversation_id (uuid4) — matches the
    real-student traffic pattern where each session is independent.

    Workers are STAGGERED by duration_s/n_workers seconds at startup so
    they don't all hit the GPU in one instant burst — real students
    don't all click "ask" at the same millisecond. The stagger makes
    the test closer to a steady-state arrival pattern.

    The bracketed window for throughput reporting is [0, duration_s);
    requests sent before duration_s are counted, requests sent after
    are not. In-flight requests that complete after duration_s ARE
    captured in the record (so we can see how the GPU drains).
    """
    records: list[dict[str, Any]] = []
    records_lock = asyncio.Lock()
    stagger_per_worker_s = duration_s / max(n_workers, 1) / 4
    # Quarter-window stagger: workers start over the first 25% of the
    # window. By 25% in, all workers are firing. Avoids the "5 requests
    # at t=0 instantly saturate queue" artifact while still hitting full
    # concurrency for most of the test.

    async def worker(worker_idx: int) -> None:
        # Stagger start
        await asyncio.sleep(stagger_per_worker_s * worker_idx)
        uid = f"loadtest-conc-{worker_idx:03d}-{uuid.uuid4().hex[:8]}"
        conv_id = str(uuid.uuid4())
        prompt_idx = worker_idx  # rotate starting prompt per worker
        async with httpx.AsyncClient(timeout=http_timeout_s) as client:
            while True:
                elapsed = time.monotonic() - test_start_s
                if elapsed >= duration_s:
                    return
                prompt = prompts[prompt_idx % len(prompts)]
                prompt_idx += 1
                rec = await one_request(
                    client, base_url, api_key, uid, conv_id, prompt,
                    test_start_s, active_concurrency=n_workers,
                )
                rec["worker_idx"] = worker_idx
                async with records_lock:
                    records.append(rec)

    tasks = [asyncio.create_task(worker(i)) for i in range(n_workers)]
    await asyncio.gather(*tasks)
    return records


async def run_burst(
    base_url: str, api_key: str, n: int,
    prompts: list[str], test_start_s: float, http_timeout_s: float,
) -> list[dict[str, Any]]:
    """N simultaneous requests, one shot. Each gets a unique uid
    (defeats per-uid rate limit) and unique conversation_id."""
    async with httpx.AsyncClient(timeout=http_timeout_s) as client:
        async def one(i: int) -> dict[str, Any]:
            uid = f"loadtest-burst-{i:03d}-{uuid.uuid4().hex[:8]}"
            conv_id = str(uuid.uuid4())
            prompt = prompts[i % len(prompts)]
            rec = await one_request(
                client, base_url, api_key, uid, conv_id, prompt,
                test_start_s, active_concurrency=n,
            )
            rec["worker_idx"] = i
            return rec
        tasks = [asyncio.create_task(one(i)) for i in range(n)]
        return list(await asyncio.gather(*tasks))


async def run_ramp(
    base_url: str, api_key: str, start: int, end: int, duration_s: int,
    prompts: list[str], test_start_s: float, http_timeout_s: float,
) -> list[dict[str, Any]]:
    """Linear ramp from `start` to `end` concurrent workers over duration_s.

    Implementation: spawn `end` workers up front; each worker only sends a
    request if its index < current_target_concurrency. Workers above the
    threshold sleep 0.25s and re-check. This avoids tearing down + rebuilding
    httpx clients every second.
    """
    records: list[dict[str, Any]] = []
    records_lock = asyncio.Lock()

    def current_target(elapsed_s: float) -> int:
        if elapsed_s <= 0:
            return start
        if elapsed_s >= duration_s:
            return end
        frac = elapsed_s / duration_s
        return int(round(start + (end - start) * frac))

    async def worker(worker_idx: int) -> None:
        uid = f"loadtest-ramp-{worker_idx:03d}-{uuid.uuid4().hex[:8]}"
        conv_id = str(uuid.uuid4())
        prompt_idx = worker_idx
        async with httpx.AsyncClient(timeout=http_timeout_s) as client:
            while True:
                elapsed = time.monotonic() - test_start_s
                if elapsed >= duration_s:
                    return
                target = current_target(elapsed)
                if worker_idx >= target:
                    # Not active this second — sleep and recheck.
                    await asyncio.sleep(0.25)
                    continue
                prompt = prompts[prompt_idx % len(prompts)]
                prompt_idx += 1
                rec = await one_request(
                    client, base_url, api_key, uid, conv_id, prompt,
                    test_start_s, active_concurrency=target,
                )
                rec["worker_idx"] = worker_idx
                async with records_lock:
                    records.append(rec)

    tasks = [asyncio.create_task(worker(i)) for i in range(end)]
    await asyncio.gather(*tasks)
    return records


async def run_warmup(
    base_url: str, api_key: str, n: int, http_timeout_s: float,
) -> list[dict[str, Any]]:
    """Sequential warmup requests to load the model. Excluded from main stats."""
    records: list[dict[str, Any]] = []
    async with httpx.AsyncClient(timeout=http_timeout_s) as client:
        for i in range(n):
            uid = f"loadtest-warmup-{i:03d}-{uuid.uuid4().hex[:8]}"
            conv_id = str(uuid.uuid4())
            prompt = SAFE_PROMPTS[i % len(SAFE_PROMPTS)]
            rec = await one_request(
                client, base_url, api_key, uid, conv_id, prompt,
                test_start_s=time.monotonic(), active_concurrency=1,
            )
            rec["worker_idx"] = -1
            records.append(rec)
    return records


# ─── Analysis ────────────────────────────────────────────────────────
def percentile(values: list[float], pct: float) -> float:
    """Linear-interpolated percentile. pct in [0, 100]."""
    if not values:
        return 0.0
    s = sorted(values)
    if pct <= 0:
        return s[0]
    if pct >= 100:
        return s[-1]
    k = (len(s) - 1) * (pct / 100.0)
    f = int(k)
    c = min(f + 1, len(s) - 1)
    if f == c:
        return s[f]
    return s[f] + (s[c] - s[f]) * (k - f)


def summarize(
    records: list[dict[str, Any]], duration_s: float,
    *, window_s: float | None = None,
) -> dict[str, Any]:
    """Stats over a record set.

    `window_s` (optional): only include records with sent_at_s < window_s
    when computing throughput. This isolates the bracketed test window
    from the trailing drain period (in-flight requests that complete
    after the cutoff). When None, duration_s is used as the window.
    """
    total = len(records)
    if total == 0:
        return {"total_requests": 0, "successful": 0, "failed": 0}
    success = [r for r in records if r["success"]]
    failed = [r for r in records if not r["success"]]
    wall_latencies = [r["wall_latency_ms"] for r in success if r["wall_latency_ms"] is not None]
    server_latencies = [r["server_latency_ms"] for r in success if r["server_latency_ms"] is not None]
    rate_limited = sum(1 for r in records if r["rate_limited"])
    ollama_timeouts = sum(1 for r in records if r["ollama_timeout"])
    client_timeouts = sum(1 for r in records if r["error"] and "client_timeout" in (r["error"] or ""))
    status_5xx = sum(1 for r in records if r["status_code"] and 500 <= r["status_code"] < 600)

    def stats(vals: list[float]) -> dict[str, Any]:
        if not vals:
            return {"n": 0}
        return {
            "n": len(vals),
            "min": int(min(vals)),
            "p50": int(percentile(vals, 50)),
            "p90": int(percentile(vals, 90)),
            "p95": int(percentile(vals, 95)),
            "p99": int(percentile(vals, 99)),
            "max": int(max(vals)),
            "mean": int(statistics.mean(vals)),
        }

    # Throughput is computed over the bracketed window — successful
    # requests SENT within [0, window_s) divided by window_s. This
    # ignores drain-period completions that the bare gather() wall
    # time would otherwise dilute.
    cutoff = window_s if window_s is not None else duration_s
    success_in_window = [r for r in success if r.get("sent_at_s", 0) < cutoff]
    throughput_per_s = round(len(success_in_window) / cutoff, 3) if cutoff > 0 else 0.0

    return {
        "total_requests": total,
        "successful": len(success),
        "failed": len(failed),
        "success_rate": round(len(success) / total, 4),
        "throughput_req_per_s": throughput_per_s,
        "throughput_window_s": cutoff,
        "successes_in_window": len(success_in_window),
        "rate_limited_429": rate_limited,
        "ollama_timeouts_502": ollama_timeouts,
        "client_timeouts": client_timeouts,
        "status_5xx": status_5xx,
        "wall_latency_ms": stats(wall_latencies),
        "server_latency_ms": stats(server_latencies),
    }


def write_reports(
    mode: str,
    args_dict: dict[str, Any],
    warmup_records: list[dict[str, Any]],
    main_records: list[dict[str, Any]],
    duration_s: float,
    out_dir: str = "/tmp",
    *,
    test_window_s: float | None = None,
) -> tuple[str, str]:
    """Write JSON + Markdown reports. Returns (json_path, md_path).

    `test_window_s`: bracketed test window (the configured --duration).
    Throughput in the report uses this, not the gather() wall time, so
    drain-period completions don't dilute the rate.
    """
    ts = datetime.datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    json_path = f"{out_dir}/loadtest_{mode}_{ts}.json"
    md_path = f"{out_dir}/loadtest_{mode}_{ts}.md"

    window = test_window_s if test_window_s is not None else duration_s
    summary = summarize(main_records, duration_s, window_s=window)
    warmup_summary = summarize(warmup_records, max(1.0, duration_s))

    payload = {
        "mode": mode,
        "args": args_dict,
        "started_utc": ts,
        "duration_s": duration_s,
        "warmup_summary": warmup_summary,
        "summary": summary,
        "warmup_records": warmup_records,
        "records": main_records,
    }
    with open(json_path, "w") as f:
        json.dump(payload, f, indent=2, default=str)

    # Markdown report — operator-facing skim
    lines = [
        f"# Dr. Hex Load Test — {mode}",
        f"Generated {datetime.datetime.utcnow().isoformat()}Z",
        f"Target: `{args_dict.get('base_url')}`",
        "",
        "## Configuration",
        "",
        "```json",
        json.dumps(args_dict, indent=2),
        "```",
        "",
        "## Summary",
        "",
        f"- **Total requests:** {summary.get('total_requests', 0)}",
        f"- **Successful:** {summary.get('successful', 0)} ({100 * summary.get('success_rate', 0):.1f}%)",
        f"- **Failed:** {summary.get('failed', 0)}",
        f"- **Throughput:** {summary.get('throughput_req_per_s', 0)} req/s "
        f"({summary.get('successes_in_window', 0)} successes in "
        f"{summary.get('throughput_window_s', 0):.1f}s test window)",
        f"- **Rate-limited (429):** {summary.get('rate_limited_429', 0)}",
        f"- **Ollama timeouts (502 / GPU contention):** {summary.get('ollama_timeouts_502', 0)}",
        f"- **Client timeouts:** {summary.get('client_timeouts', 0)}",
        f"- **5xx (non-timeout):** {summary.get('status_5xx', 0) - summary.get('ollama_timeouts_502', 0)}",
        "",
        "## Latency — wall-clock (client→server→client)",
        "",
        "| min | p50 | p90 | p95 | p99 | max | mean |",
        "|-----|-----|-----|-----|-----|-----|------|",
    ]
    wl = summary.get("wall_latency_ms", {})
    if wl.get("n"):
        lines.append(
            f"| {wl['min']}ms | {wl['p50']}ms | {wl['p90']}ms | {wl['p95']}ms | "
            f"{wl['p99']}ms | {wl['max']}ms | {wl['mean']}ms |"
        )
    else:
        lines.append("| (no successful requests) |")
    lines += [
        "",
        "## Latency — server-reported (orchestrator-internal `latency_ms`)",
        "",
        "| min | p50 | p90 | p95 | p99 | max | mean |",
        "|-----|-----|-----|-----|-----|-----|------|",
    ]
    sl = summary.get("server_latency_ms", {})
    if sl.get("n"):
        lines.append(
            f"| {sl['min']}ms | {sl['p50']}ms | {sl['p90']}ms | {sl['p95']}ms | "
            f"{sl['p99']}ms | {sl['max']}ms | {sl['mean']}ms |"
        )
    else:
        lines.append("| (no successful requests) |")

    # Warmup section
    lines += [
        "",
        "## Warmup (excluded from main stats)",
        "",
        f"- Requests: {warmup_summary.get('total_requests', 0)}",
        f"- Successful: {warmup_summary.get('successful', 0)}",
    ]
    wwl = warmup_summary.get("wall_latency_ms", {})
    if wwl.get("n"):
        lines.append(f"- Warmup wall latency p50/p95/max: {wwl['p50']}ms / {wwl['p95']}ms / {wwl['max']}ms")

    # Failure rollup
    if summary.get("failed"):
        lines += ["", "## Failure samples (first 10)", "", "```"]
        n_shown = 0
        for r in main_records:
            if r["success"] or n_shown >= 10:
                continue
            lines.append(
                f"  status={r['status_code']} ollama_timeout={r['ollama_timeout']} "
                f"rate_limited={r['rate_limited']} error={(r.get('error') or '')[:160]}"
            )
            n_shown += 1
        lines.append("```")

    # Interpretation guide
    lines += [
        "",
        "## Interpretation",
        "",
        f"- **Baseline (adversarial-suite, single inference):** p50 ~28s, p95 ~49s on qwen2.5:7b / Intel Arc Pro B60 24GB.",
        f"- If this run's wall p95 ≈ server p95 → network/queuing is negligible, the model itself is the bottleneck.",
        f"- If wall p95 >> server p95 → the orchestrator is queuing requests (single GPU, serialized ollama).",
        f"- **`ollama_timeouts_502` > 0** → at least one request hit the orchestrator's 60s ceiling: hard signal that the configured concurrency is over the GPU's headroom.",
        f"- **`rate_limited_429` > 0** at this UID-per-worker setup → bug in the test (each worker should be under 50/hr), NOT in the orchestrator.",
        "",
    ]

    with open(md_path, "w") as f:
        f.write("\n".join(lines))

    return json_path, md_path


# ─── CLI / entrypoint ────────────────────────────────────────────────
def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Load test the Dr. Hex orchestrator.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    p.add_argument("--base-url", default=BASE_URL_DEFAULT,
                   help=f"Orchestrator URL (default {BASE_URL_DEFAULT})")
    p.add_argument("--api-key", default=API_KEY_DEFAULT,
                   help="X-API-Key value (defaults to HEX_AI_API_KEY env or dev key)")
    p.add_argument("--warmup", type=int, default=1,
                   help="Sequential warmup requests before the timed window (default 1)")
    p.add_argument("--http-timeout", type=float, default=HTTP_TIMEOUT_S_DEFAULT,
                   help=f"Per-request HTTP timeout (default {HTTP_TIMEOUT_S_DEFAULT}s)")
    p.add_argument("--allow-remote", action="store_true",
                   help="Bypass localhost-only safety check (DANGEROUS — bypasses prod tunnel guard)")
    p.add_argument("--out-dir", default="/tmp",
                   help="Where to write reports (default /tmp)")

    mode = p.add_mutually_exclusive_group(required=True)
    mode.add_argument("--concurrent", type=int, metavar="N",
                      help="Sustained concurrent mode: N virtual users")
    mode.add_argument("--burst", type=int, metavar="N",
                      help="Burst mode: N simultaneous requests, one shot")
    mode.add_argument("--ramp", type=int, nargs=2, metavar=("START", "END"),
                      help="Ramp mode: ramp concurrency START → END")

    p.add_argument("--duration", type=int, default=60,
                   help="Duration in seconds (concurrent + ramp modes; default 60)")

    return p.parse_args()


def enforce_localhost(base_url: str, allow_remote: bool) -> None:
    """Refuse to hit anything but loopback unless explicitly allowed.
    This is the production-tunnel guard required by CLAUDE.md."""
    parsed = urlparse(base_url)
    host = (parsed.hostname or "").lower()
    if host in ("127.0.0.1", "localhost", "::1"):
        return
    if allow_remote:
        print(f"WARNING: --allow-remote set, hitting non-localhost host {host!r}.",
              file=sys.stderr)
        return
    print(
        f"ERROR: base_url host {host!r} is not loopback. Load tests must NOT "
        f"go through the production tunnel. Set --allow-remote to override.",
        file=sys.stderr,
    )
    sys.exit(2)


async def amain() -> int:
    args = parse_args()
    enforce_localhost(args.base_url, args.allow_remote)

    args_dict = {
        "base_url": args.base_url,
        "warmup": args.warmup,
        "http_timeout": args.http_timeout,
        "duration": args.duration,
        "concurrent": args.concurrent,
        "burst": args.burst,
        "ramp": args.ramp,
    }

    print(f"=== Dr. Hex orchestrator load test ===")
    print(f"Target:        {args.base_url}")
    print(f"HTTP timeout:  {args.http_timeout}s")
    print(f"Warmup:        {args.warmup} request(s)")
    if args.concurrent:
        mode = "concurrent"
        print(f"Mode:          concurrent ({args.concurrent} workers, {args.duration}s)")
    elif args.burst:
        mode = "burst"
        print(f"Mode:          burst ({args.burst} simultaneous requests)")
    else:
        mode = "ramp"
        print(f"Mode:          ramp ({args.ramp[0]} → {args.ramp[1]} workers over {args.duration}s)")
    print()

    # ── Warmup ──
    warmup_records: list[dict[str, Any]] = []
    if args.warmup > 0:
        print(f"Warmup ({args.warmup} sequential request(s))...")
        warmup_records = await run_warmup(
            args.base_url, args.api_key, args.warmup, args.http_timeout,
        )
        for i, r in enumerate(warmup_records):
            status = "OK" if r["success"] else f"FAIL({r['status_code']})"
            print(f"  [{i+1}] {status}  wall={r['wall_latency_ms']}ms  "
                  f"server={r.get('server_latency_ms')}ms")

    # ── Main test ──
    test_start_s = time.monotonic()
    print()
    print("Main test starting...")
    if args.concurrent:
        main_records = await run_concurrent(
            args.base_url, args.api_key, args.concurrent, args.duration,
            SAFE_PROMPTS, test_start_s, args.http_timeout,
        )
        duration_actual = time.monotonic() - test_start_s
    elif args.burst:
        main_records = await run_burst(
            args.base_url, args.api_key, args.burst,
            SAFE_PROMPTS, test_start_s, args.http_timeout,
        )
        duration_actual = time.monotonic() - test_start_s
    else:
        main_records = await run_ramp(
            args.base_url, args.api_key, args.ramp[0], args.ramp[1], args.duration,
            SAFE_PROMPTS, test_start_s, args.http_timeout,
        )
        duration_actual = time.monotonic() - test_start_s

    # ── Reports ──
    # Bracketed window for throughput math: in concurrent + ramp mode it's
    # the user-configured duration; in burst mode it's the actual wall time
    # (all requests fire at t=0 anyway).
    test_window = args.duration if (args.concurrent or args.ramp) else duration_actual
    json_path, md_path = write_reports(
        mode, args_dict, warmup_records, main_records, duration_actual,
        out_dir=args.out_dir, test_window_s=test_window,
    )

    summary = summarize(main_records, duration_actual, window_s=test_window)
    print()
    print("=== RESULTS ===")
    print(f"Total:       {summary.get('total_requests', 0)}")
    print(f"Successful:  {summary.get('successful', 0)} ({100 * summary.get('success_rate', 0):.1f}%)")
    print(f"Failed:      {summary.get('failed', 0)}")
    print(f"Throughput:  {summary.get('throughput_req_per_s', 0)} req/s")
    print(f"429:         {summary.get('rate_limited_429', 0)}")
    print(f"Ollama 502:  {summary.get('ollama_timeouts_502', 0)}")
    wl = summary.get("wall_latency_ms", {})
    if wl.get("n"):
        print(f"Wall latency p50/p95/p99/max: "
              f"{wl['p50']}ms / {wl['p95']}ms / {wl['p99']}ms / {wl['max']}ms")
    sl = summary.get("server_latency_ms", {})
    if sl.get("n"):
        print(f"Server latency p50/p95/p99/max: "
              f"{sl['p50']}ms / {sl['p95']}ms / {sl['p99']}ms / {sl['max']}ms")
    print()
    print(f"JSON report: {json_path}")
    print(f"MD report:   {md_path}")

    if summary.get("failed", 0) > 0:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(amain()))
