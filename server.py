#!/usr/bin/env python3

import os
import json
import http.server
import socketserver
from urllib.parse import urlparse, parse_qs

class EnvironmentHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/api/env':
            # Return environment variables as JSON
            env_vars = {
                'SUPABASE_URL': os.environ.get('SUPABASE_URL', ''),
                'SUPABASE_ANON_KEY': os.environ.get('SUPABASE_ANON_KEY', ''),
                'status': 'ok'
            }
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(env_vars).encode())
            return
        
        # Serve static files for all other requests
        return super().do_GET()

PORT = 5000
Handler = EnvironmentHandler

with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"Serving at http://0.0.0.0:{PORT}")
    print(f"Environment variables:")
    print(f"  SUPABASE_URL: {'Set' if os.environ.get('SUPABASE_URL') else 'Not set'}")
    print(f"  SUPABASE_ANON_KEY: {'Set' if os.environ.get('SUPABASE_ANON_KEY') else 'Not set'}")
    httpd.serve_forever()