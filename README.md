# prisel

[![Build Status](https://travis-ci.org/SeawolvesAtCali/prisel.svg?branch=master)](https://travis-ci.org/SeawolvesAtCali/prisel)
[![License](https://img.shields.io/npm/l/@prisel/server.svg)](https://www.npmjs.com/package/@prisel/server)
[![version](https://img.shields.io/npm/v/@prisel/server.svg)](https://www.npmjs.com/package/@prisel/server)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

Node.js game server for your next multiplayer game.

# Features

-   **Opinionated room system** Prisel comes with a default room system with reasonable that handles
    player joining/leaving, room capacity and game phase. It also allows us to customize the room
    behavior.
-   **Freedom of game logic implementation** Prisel doesn't make assumption about the types of games
    we are making. It leaves the game logic implementation and state synchronization to developers.
-   **Client side technology agnostic** Prisel aims at providing a robust server side solution while
    maintaining a simple server-client communication protocal. Prisel speaks WebSocket using simple
    JSON. It should be fairly easy to build a client using any languages with WebSocket support.
-   **Develop server in JavaScript or TypeScript** Although the prisel is developed in TypeScript,
    it is built with pure JavaScript intergration in mind.
-   **Testing and debugging support** Prisel provides utility for testing and debugging our games.

# Get Started

## Install

### Server

```bash
$ npm i @prisel/server
```

```javascript
import { Server } from '@prisel/server';

const server = new Server();
server.start(); // server will start at ws://localhost:3000
```

More server docs see `@prisel/server`
[README](https://github.com/SeawolvesAtCali/prisel/tree/master/packages/server)

### Client

```bash
$ npm i @prisel/client
```

```javascript
import { Client, Messages, MessageType } from '@prisel/client';

const client = new Client('ws://localhost:3000');

(async function() {
    await client.connect();
    const { userId } = await client.login('my-username'));
    client.emit(...Messages.getCreateRoom('room-name'));
    await client.once(MessageType.SUCCESS);
    console.log('we are in a room');
})();
```

# Concept

`prisel` is built with room based online game in mind. It's great for games that are short and
played by a small group of players, such as board games, fighting games. It is not suitable for
games allowing massive online players or long play times across multiple sessions.

### Player

player represent a user connected to our server. After connection user needs to login with username
(We are working on the detail of authentication). Player not currently in a room can create a room
or join a room. A player can only be in one room at a time. To join another room, the player needs
to leave the current room first.

### Room

Room is a group of players that plays game together. All the players in the room are participating
in the game. A room can have a host. Host is one of the player with privilege to start a game. Room
is a transient object. When all the players leave a room, the room will be closed.

### Game

Game is the most important concept in prisel. Players need to be inside a room to play a game. Each
game has the following lifecycle methods that we can override to describe our game logics:

#### Preparing

-   [**`onSetup`**](docs/API.md#onsetup-handle--object)
-   [**`canStart`**](docs/API.md#canstart-handle--boolean)

#### Running

-   [**`onStart`**](docs/API.md#onstart-handle--void)

#### Ending

-   [**`onEnd`**](docs/API.md#onend-handle--void)

Some common APIs for all lifecycles that we can implement are

-   [**`onMessage`**](docs/API.md#onmessage-handle-player-data--void)
-   [**`onAddPlayer`**](docs/API.md#onaddplayer-handle-player--void)
-   [**`onRemovePlayer`**](docs/API.md#onremoveplayer-handle-player--void)

Detail usage of each lifecycle method is [below](#game-1)

### Handle

`Handle` is a collection of utilities to access/modify the game/room state and send messages to
clients. All game and room functions have access to `Handle`.

More detail on [Handle's API doc](docs/API.md#handle)

# What's next

-   Check out our [API documentation](docs/API.md).
-   If you want to build a client, check out the [message types](docs/MESSAGE_TYPES.md).
-   [Tutorial](docs/TUTORIAL.md) is comming soon.
