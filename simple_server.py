#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
from urllib.parse import urlparse, parse_qs

PORT = 5000

class SimpleHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/env':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            
            # Return environment variables
            env_data = {
                'SUPABASE_URL': os.getenv('SUPABASE_URL', 'https://gfvslfufxecbqwicrixm.supabase.co'),
                'SUPABASE_ANON_KEY': os.getenv('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmdnNsZnVmeGVjYnF3aWNyaXhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNzM1NzksImV4cCI6MjA2ODg0OTU3OX0.7IiJeXtAbRZ_0yr46tUn2IsaNeX3uUhgm8WbBqx46cA'),
                'status': 'ok'
            }
            
            self.wfile.write(json.dumps(env_data).encode())
        else:
            # Serve static files
            super().do_GET()

def find_free_port():
    import socket
    for port in range(5000, 5100):
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind(('0.0.0.0', port))
                return port
        except OSError:
            continue
    return None

if __name__ == "__main__":
    port = find_free_port()
    if port is None:
        print("No free ports found in range 5000-5099")
        exit(1)
    
    print(f"Serving at http://0.0.0.0:{port}")
    print("Environment variables:")
    print(f"  SUPABASE_URL: {'Set' if os.getenv('SUPABASE_URL') else 'Not set'}")
    print(f"  SUPABASE_ANON_KEY: {'Set' if os.getenv('SUPABASE_ANON_KEY') else 'Not set'}")
    
    with socketserver.TCPServer(("0.0.0.0", port), SimpleHTTPRequestHandler) as httpd:
        httpd.serve_forever()