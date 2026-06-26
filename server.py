import os, http.server, socketserver, socket
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = int(os.environ.get("PORT", 8080))

class DualStackServer(socketserver.TCPServer):
    address_family = socket.AF_INET6
    allow_reuse_address = True
    def server_bind(self):
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        super().server_bind()

with DualStackServer(("", PORT), http.server.SimpleHTTPRequestHandler) as httpd:
    httpd.serve_forever()
