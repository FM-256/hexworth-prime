#!/usr/bin/env python3
"""Alertmanager webhook -> ntfy relay.

Alertmanager POSTs its fixed webhook JSON schema (a top-level object with an
`alerts` array) to this server. ntfy, when POSTed a topic-suffixed URL, treats
the body as opaque text -- so posting Alertmanager's raw JSON straight to ntfy
yields an unreadable blob on the phone. This relay parses the payload, iterates
every alert in the group, and publishes one readable, severity-tagged ntfy
message per alert (firing and resolved). Stdlib only, so python:3.11-slim needs
no pip install.
"""
import http.server
import json
import os
import urllib.request

NTFY_URL = os.environ.get("NTFY_URL", "http://ntfy/hexworth-alerts")
LISTEN_PORT = int(os.environ.get("LISTEN_PORT", "9099"))


def post_ntfy(title, message, priority, tags):
    """Publish a single formatted message to the ntfy topic via HTTP headers."""
    req = urllib.request.Request(NTFY_URL, data=message.encode("utf-8"), method="POST")
    req.add_header("Title", title)
    req.add_header("Priority", priority)
    req.add_header("Tags", tags)
    try:
        urllib.request.urlopen(req, timeout=10).read()
    except Exception as exc:  # noqa: BLE001 - never let a push error kill the relay
        print("ntfy post failed:", exc, flush=True)


def format_alert(alert):
    """Map one Alertmanager alert object to (title, message, priority, tags)."""
    status = alert.get("status", "firing")
    labels = alert.get("labels", {})
    ann = alert.get("annotations", {})
    severity = labels.get("severity", "info")
    summary = ann.get("summary") or labels.get("alertname", "alert")
    description = ann.get("description", "") or summary
    if status == "resolved":
        return ("RESOLVED: " + summary, description, "default", "white_check_mark")
    if severity == "critical":
        return (summary, description, "urgent", "rotating_light")
    return (summary, description, "high", "warning")


class Handler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        """Receive an Alertmanager webhook and fan its alerts out to ntfy."""
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b""
        try:
            payload = json.loads(raw) if raw else {}
        except ValueError:
            payload = {}
        alerts = payload.get("alerts", [])
        for alert in alerts:
            title, message, priority, tags = format_alert(alert)
            post_ntfy(title, message, priority, tags)
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"ok")

    def do_GET(self):
        """Trivial health endpoint so the container is easy to probe."""
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"webhook-ntfy relay ok")

    def log_message(self, *args):  # noqa: D401 - silence default request logging
        return


if __name__ == "__main__":
    http.server.HTTPServer(("0.0.0.0", LISTEN_PORT), Handler).serve_forever()
