#!/usr/bin/env python3
"""Servidor static com Cache-Control: no-store para o preview ao vivo.
Garante que o navegador/preview sempre sirva os arquivos mais recentes,
sem usar cópias em cache."""
import http.server
import socketserver
import os

PORT = 8000
DIR = os.path.dirname(os.path.abspath(__file__))

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        # log resumido
        print(self.address_string(), fmt % args)

if __name__ == "__main__":
    os.chdir(DIR)
    with socketserver.TCPServer(("0.0.0.0", PORT), NoCacheHandler) as httpd:
        print(f"Servindo {DIR} em http://0.0.0.0:{PORT} (no-store)")
        httpd.serve_forever()
