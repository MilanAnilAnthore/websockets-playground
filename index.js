const http = require("http");
const { json } = require("stream/consumers");
const crypto = require("crypto");
const express = require("express");
const webSocketServer = require("websocket").server;

const app = express();
app.listen(9091, ()=> console.log("Listening on server 9091"));
app.get("/", (req,res)=>{
    res.sendFile(__dirname + "/index.html")
})


const httpServer = http.createServer();
httpServer.listen(9090, ()=> console.log("Listening on port 9090"));

const clients = {};
const games = {};

const wsServer = new webSocketServer({
    "httpServer" : httpServer
});

wsServer.on("request", request =>{

    // connection
    const connection = request.accept(null, request.origin);

    connection.on("open", ()=> console.log("Connection open"));
    connection.on("close", ()=> console.log("Connection closed"));

    connection.on("message", message =>{

        const result = JSON.parse(message.utf8Data);
        
        // I have received a message from client
        //a user want to create a new gane
        if(result.method === "create"){
            const clientId = result.clientId;
            const gameId = crypto.randomUUID();

            games[gameId]={
                "id": gameId,
                "balls": 20
            }

            const payLoad = {
                "method": "create",
                "game": games[gameId]
            }

            const con = clients[clientId].connection;
            con.send(JSON.stringify(payLoad))
        }
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
    connection.send(JSON.stringify(payload));
})