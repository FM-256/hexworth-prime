from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs
from datetime import datetime

LOG = "honeypot.log"
PAGE = b"""<!doctype html><html><head><title>Admin Portal</title></head>
<body style='font-family:Arial,sans-serif;max-width:520px;margin:60px auto'>
<h1>System Administration</h1><p>Authorized users only.</p>
<form method='POST' action='/login'>
<label>Username</label><br><input name='username'><br><br>
<label>Password</label><br><input name='password' type='password'><br><br>
<button type='submit'>Sign in</button></form></body></html>"""

class Handler(BaseHTTPRequestHandler):
    def log_event(self, event):
        line = f"{datetime.now().isoformat()} source={self.client_address[0]} {event}\n"
        with open(LOG, "a") as f:
            f.write(line)
        print(line, end="")

    def do_GET(self):
        self.log_event(f'GET path="{self.path}" agent="{self.headers.get("User-Agent","")}"')
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        self.wfile.write(PAGE)

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length).decode(errors="replace")
        fields = parse_qs(body)
        username = fields.get("username", [""])[0]
        # Training design: usernames are logged; submitted passwords are never logged.
        self.log_event(f'LOGIN_ATTEMPT path="{self.path}" username="{username}"')
        self.send_response(403)
        self.send_header("Content-Type", "text/html")
        self.end_headers()
        self.wfile.write(b"<h1>Access denied</h1><p>This event was logged.</p>")

if __name__ == "__main__":
    print("Training honeypot listening on 0.0.0.0:8080")
    print("Use only inside the instructor-authorized classroom environment.")
    HTTPServer(("0.0.0.0", 8080), Handler).serve_forever()
