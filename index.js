const http = require("http");
const crypto = require("crypto");
const express = require("express");
const webSocketServer = require("websocket").server;

const app = express();
app.listen(9091, () => console.log("Listening on server 9091"));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})


const httpServer = http.createServer();
httpServer.listen(9090, () => console.log("Listening on port 9090"));

const clients = {};
const games = {};

const wsServer = new webSocketServer({
    "httpServer": httpServer
});

wsServer.on("request", request => {

    // connection
    const connection = request.accept(null, request.origin);

    connection.on("open", () => console.log("Connection open"));
    connection.on("close", () => console.log("Connection closed"));

    connection.on("message", message => {

        const result = JSON.parse(message.utf8Data);

        // I have received a message from client
        //a user want to create a new gane
        if (result.method === "create") {
            const clientId = result.clientId;
            const gameId = crypto.randomUUID();

            games[gameId] = {
                "id": gameId,
                "balls": 20,
                "clients": []
            }

            const payLoad = {
                "method": "create",
                "game": games[gameId],
            }

            const con = clients[clientId].connection;
            con.send(JSON.stringify(payLoad))
        }

        if (result.method == "join") {
            const clientId = result.clientId;
            const gameId = result.gameId;

            const game = games[gameId]
            if (game.clients.length >= 3) {
                console.log("Max players reached")
                return
            }
            else {
                const color = { "0": "red", "1": "Green", "2": "Blue" }[game.clients.length]
                game.clients.push({
                    "clientId": clientId,
                    "color": color
                })
            }

            // start the game
            if (game.clients.length === 3) updateGameState();

            const payLoad = {
                "method": "join",
                "game": game
            }

            // Loop through all clients and tell them that people have joined
            game.clients.forEach(c => {
                clients[c.clientId].connection.send(JSON.stringify(payLoad))
            });

        }

        // a user plays
        if (result.method === "play") {
            const clientId = result.clientId;
            const gameId = result.gameId;
            const ballId = result.ballId;
            const color = result.color;
            const game = games[gameId]
            let state = game.state;

            if (!state) {
                state = {};
            }

            state[ballId] = color;
            games[gameId].state = state;


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

function updateGameState() {

    for (const g of Object.keys(games)) {
        const game = games[g];
        const payLoad = {
            "method": "update",
            "game": game
        }

        game.clients.forEach(c => {
            clients[c.clientId].connection.send(JSON.stringify(payLoad))
        })
    }

    setTimeout(updateGameState, 500);
}