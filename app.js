const http = require('http');
let version = process.env.VERSION_BUILD;

if (!version) {
    version = "1";
}

const hostname = '0.0.0.0';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Application Version version');
});

server.listen(port, hostname, () => {
    console.log(`Server running`);
});
