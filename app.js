const http = require('http');
const process = require("process");
let versibuild = process.env.VERSION_BUILD;

if (!versibuild) {
    versibuild = "1";
}

console.log(process.env);

const hostname = '0.0.0.0';
const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('OKE MANTAP');
});

server.listen(port, hostname, () => {
    console.log(`Server running`);
});
