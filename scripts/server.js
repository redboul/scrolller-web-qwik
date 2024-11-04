import http from "http";
import { promises } from "fs";

const host = 'localhost';
const port = 8000;

const requestListener = function (req, res) {
    console.log(JSON.stringify(req.path))
    switch (req.path) {
        case '/save':
            res.writeHead(200);
            res.end('coucou');
            break;
        default:
            res.setHeader("Content-Type", "application/json");
            res.writeHead(200);
            promises.readFile("./best.json")
                .then(contents => {
                    res.end(contents);
                });
        break;
    }
    
};

const server = http.createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});