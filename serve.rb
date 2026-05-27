require 'webrick'
root = '/Users/jeffbennett/Desktop/ProductiFlow Site'
server = WEBrick::HTTPServer.new(Port: 4200, DocumentRoot: root, AccessLog: [])
trap('INT') { server.stop }
server.start
