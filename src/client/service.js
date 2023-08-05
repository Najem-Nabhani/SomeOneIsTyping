const http = require('http');
const fs = require('fs');


const handler = (req, res) => {
    if (!req.url.match(/^\/thread\/([0-9]+)$/) || req.method !== "GET") {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }

    res.writeHead(200, {
        'Content-Type': 'text/html'
    });
    fs.readFile('./index.html', null, (error, data) => {
        if (error) {
            res.writeHead(404);
            res.write('Whoops! The page is not found!');
        } else {
            res.write(data);
        }
        res.end();
    });
}

const PORT = 7000;
const server1 = http.createServer(handler);
server1.listen(PORT, () => {
    console.log(`Client started on port ${PORT}`);
});