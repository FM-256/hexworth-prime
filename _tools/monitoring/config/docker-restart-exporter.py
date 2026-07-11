#!/usr/bin/env python3
"""Docker container restart/health exporter for Prometheus.

Why this exists instead of cAdvisor: neon runs Docker with the containerd image
store (Storage Driver "overlayfs", cgroup v2). cAdvisor's per-container
enrichment reads the legacy /var/lib/docker/image/<driver>/layerdb/ layout,
which does not exist under the containerd store, so cAdvisor drops every
container and emits only the root cgroup. This exporter instead reads container
state straight from the Docker Engine API over the unix socket, so it is immune
to the storage-driver layout entirely.

It exposes exactly the signal that mattered in the 2026-07-10 incident: Docker's
RestartCount (which was ~12,942 on hexworth-redis), plus running/restarting/
health state. Stdlib only. Read-only: issues GET requests, never mutates.

SECURITY NOTE: the Docker socket is mounted (read-intent). Socket access is
root-equivalent on the host; this is mitigated by (a) the container is internal
with no published port, (b) neon is Tailscale-only, (c) this code only issues
GET /containers/... requests. Do not extend it to POST/DELETE.
"""
import http.client
import http.server
import json
import socket

DOCKER_SOCK = "/var/run/docker.sock"
LISTEN_PORT = 9101


class UnixHTTPConnection(http.client.HTTPConnection):
    """http.client connection that talks to a unix socket instead of TCP."""

    def __init__(self, sock_path):
        super().__init__("localhost")
        self._sock_path = sock_path

    def connect(self):
        s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        s.settimeout(10)
        s.connect(self._sock_path)
        self.sock = s


def docker_get(path):
    """GET a Docker Engine API path over the unix socket and parse JSON."""
    conn = UnixHTTPConnection(DOCKER_SOCK)
    try:
        conn.request("GET", path)
        resp = conn.getresponse()
        body = resp.read()
        if resp.status != 200:
            return None
        return json.loads(body)
    finally:
        conn.close()


def esc(value):
    """Escape a Prometheus label value."""
    return str(value).replace("\\", "\\\\").replace('"', '\\"')


def collect():
    """Build the Prometheus exposition text from live container state."""
    lines = [
        "# HELP docker_container_running 1 if the container is running, else 0",
        "# TYPE docker_container_running gauge",
        "# HELP docker_container_restart_count Docker RestartCount since (re)creation",
        "# TYPE docker_container_restart_count counter",
        "# HELP docker_container_restarting 1 if the container is currently restarting",
        "# TYPE docker_container_restarting gauge",
        "# HELP docker_container_health 1 for the container's current health status label",
        "# TYPE docker_container_health gauge",
    ]
    containers = docker_get("/containers/json?all=1") or []
    for c in containers:
        cid = c.get("Id", "")[:12]
        names = c.get("Names") or ["/unknown"]
        name = names[0].lstrip("/")
        info = docker_get("/containers/" + c.get("Id", "") + "/json")
        if not info:
            continue
        state = info.get("State", {}) or {}
        running = 1 if state.get("Running") else 0
        restarting = 1 if state.get("Restarting") else 0
        # RestartCount is a TOP-LEVEL field in the Docker inspect payload, NOT under
        # State (which holds Running/Restarting/Health). Reading it from State would
        # always yield 0 and ContainerCrashLooping would never fire.
        restart_count = int(info.get("RestartCount", 0) or 0)
        lbl = 'name="%s",id="%s"' % (esc(name), esc(cid))
        lines.append("docker_container_running{%s} %d" % (lbl, running))
        lines.append("docker_container_restart_count{%s} %d" % (lbl, restart_count))
        lines.append("docker_container_restarting{%s} %d" % (lbl, restarting))
        health = (state.get("Health") or {}).get("Status")
        if health:
            hlbl = 'name="%s",status="%s"' % (esc(name), esc(health))
            lines.append("docker_container_health{%s} 1" % hlbl)
    return "\n".join(lines) + "\n"


class Handler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        """Serve /metrics; anything else is a trivial health check."""
        if self.path.rstrip("/") in ("/metrics", ""):
            try:
                out = collect().encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "text/plain; version=0.0.4")
                self.end_headers()
                self.wfile.write(out)
            except Exception as exc:  # noqa: BLE001 - a scrape error must not kill the server
                self.send_response(500)
                self.end_headers()
                self.wfile.write(("collect failed: %s" % exc).encode("utf-8"))
        else:
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"docker-restart-exporter ok")

    def log_message(self, *args):  # noqa: D401 - silence default request logging
        return


if __name__ == "__main__":
    http.server.HTTPServer(("0.0.0.0", LISTEN_PORT), Handler).serve_forever()
