const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = { '.html': 'text/html', '.json': 'application/json', '.js': 'text/javascript' };
const PORT = process.env.PORT || 8080;

http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  const p = urlPath === '/' ? '/index.html' : urlPath;
  const fp = path.join(__dirname, decodeURIComponent(p));
  fs.readFile(fp, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': mime[path.extname(fp)] || 'text/plain' });
    res.end(data);
  });
}).listen(PORT, () => console.log('serving on ' + PORT));
