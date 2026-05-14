WebSockets Playground

![Gameplay Screenshot](assets/Screenshot%202026-05-13%20225917.png)

A multiplayer ball-claiming game built to learn how **WebSockets** work in practice. Three players connect to a shared game board of 20 balls and race to claim them by clicking — all synchronized in real-time via a WebSocket server.

> **Note:** This is a learning project, not a production app. It intentionally keeps things simple to focus on understanding WebSocket concepts like persistent connections, message-based communication, and real-time state broadcasting.

## 📸 How It Works

1. One player clicks **"New Game"** → the server creates a game and returns a Game ID.
2. Other players paste the Game ID into the input field and click **"Join Game"**.
3. Once **3 players** have joined, the server starts broadcasting game state updates every 500ms.
4. Players click on balls to claim them with their assigned color (**Red**, **Green**, or **Blue**).
5. Claimed balls are reflected on every player's board in real-time.

## 🛠️ Tech Stack

| Layer  | Technology                                                 |
| ------ | ---------------------------------------------------------- |
| Server | [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) + [websocket](https://www.npmjs.com/package/websocket) |
| Client | Vanilla HTML + JavaScript (served via Express)             |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)

### Installation

```bash
git clone https://github.com/MilanAnilAnthore/websockets-playground.git
cd websockets-playground
npm install
```

### Running

```bash
node index.js
```

This starts two servers:

| Server     | Port   | Purpose                        |
| ---------- | ------ | ------------------------------ |
| Express    | `9091` | Serves the HTML game client    |
| WebSocket  | `9090` | Handles real-time game logic   |

Open **http://localhost:9091** in your browser. To simulate multiplayer, open it in 3 separate browser tabs.

## 🏗️ Architecture

```
Client (browser)                      Server (Node.js)
┌──────────────┐                    ┌──────────────────┐
│  index.html  │◄──── HTTP ────────│  Express (:9091)  │
│              │                    └──────────────────┘
│  JavaScript  │◄── WebSocket ────►│  WS Server (:9090)│
└──────────────┘                    └──────────────────┘
```

### Message Protocol

All communication uses JSON messages with a `method` field:

| Method      | Direction        | Description                          |
| ----------- | ---------------- | ------------------------------------ |
| `connect`   | Server → Client  | Assigns a unique `clientId`          |
| `create`    | Client → Server  | Requests a new game                  |
| `create`    | Server → Client  | Returns the created game object      |
| `join`      | Client → Server  | Joins an existing game by ID         |
| `join`      | Server → Client  | Broadcasts updated player list       |
| `play`      | Client → Server  | Claims a ball with the player's color|
| `update`    | Server → Client  | Broadcasts full game state (every 500ms) |

## 🐛 Known Bugs & Rough Edges

This was built purely for learning, so there are several issues I'm aware of:

- **Off-by-one in ball rendering** — The loop uses `i <= game.balls` instead of `i < game.balls`, creating 21 balls instead of 20. Ball IDs also start at 2 (since `id = i + 1` with `i` starting at 0) while ball 1 is never rendered properly.
- **No error handling for invalid Game IDs** — Joining with a non-existent Game ID will crash the server (`Cannot read properties of undefined`).
- **No cleanup on disconnect** — When a player disconnects, their `clientId` stays in the `clients` and `games` objects. The `updateGameState` loop will crash trying to send to a dead connection.
- **Global variable leak** — `game = response.game` in the client's join handler is missing `let`/`const`, leaking `game` to the global scope.
- **No input validation** — The server trusts all incoming messages blindly. Malformed JSON or missing fields will crash it.
- **Game starts only at exactly 3 players** — There's no way to start a 2-player game or spectate.
- **`updateGameState` runs forever** — Once triggered, the 500ms broadcast loop runs for *all* games indefinitely, even finished ones.
- **Hardcoded `localhost` in client** — The WebSocket URL `ws://localhost:9090` is hardcoded in the HTML, so it won't work if deployed remotely.

## 📝 What I Learned

- How WebSocket connections differ from regular HTTP (persistent, bidirectional)
- The handshake process and how `ws://` protocol works
- Broadcasting state to multiple connected clients
- Managing shared mutable state on the server
- The challenges of real-time multiplayer synchronization

## 📄 License

[MIT](LICENSE) © Milan Anil Anthore