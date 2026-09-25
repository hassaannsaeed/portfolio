import http.server
import socketserver
import webbrowser
import sys

PORT = 8000
DIRECTORY = "."

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

def start_server():
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"==================================================")
            print(f"   FUTURISTIC PORTFOLIO DEVELOPMENT SERVER         ")
            print(f"==================================================")
            print(f"Local Server Status: Running")
            print(f"Server URL: http://localhost:{PORT}")
            print(f"Press CTRL+C to terminate the server.")
            print(f"==================================================")
            
            # Auto-open browser
            webbrowser.open(f"http://localhost:{PORT}")
            
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down. Session closed.")
        sys.exit(0)
    except Exception as e:
        print(f"\nError launching server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_server()
