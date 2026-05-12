const http = require("http");
const { json } = require("stream/consumers");
const webSocketServer = require("websocket").server;
const httpServer = http.createServer();
httpServer.listen(9090, ()=> console.log("Listening on server 9090"));

const clients = {};

const wsServer = new webSocketServer({
    "httpServer" : httpServer
});

wsServer.on("request", request =>{

    // connection
    const connection = request.accept(null, origin);

    connection.on("open", ()=> console.log("Connection open"));
    connection.on("close", ()=> console.log("Connection closed"));

    connection.on("message", message =>{
    })

    const clientId = crypto.randomUUID();
    
    clients[clientId] = {
        "connection": connection
    }

    const payload = {
        "method": "connect",
        "clientId": clientId
    }

    // Send back client connection
    connection.send(json.stringify(payload));
})