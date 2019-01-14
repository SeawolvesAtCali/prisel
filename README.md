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
played by a small group of players, such as board games, fighting games. It is not suitable for
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

-   [**`onSetup`**](#onsetup-handle--object)
-   [**`canStart`**](#canstart-handle--boolean)

#### Running

-   [**`onStart`**](#onstart-handle--void)

#### Ending

-   [**`onEnd`**](#onend-handle--void)

Some common APIs for all lifecycles that we can implement are

-   [**`onMessage`**](#onmessage-handle-player-data--void)
-   [**`onAddPlayer`**](##onaddplayer-handle-player--void)
-   [**`onRemovePlayer`**](#onremoveplayer-handle-player--void)

Detail usage of each lifecycle method is [below](#game-1)

### Handle

`Handle` is a collection of utilities we can use to access/modify the game/room state and send
messages to clients. All game and room functions have access to `Handle`.

# API

## Game

Game logic are described using a game configuration. Game configuration is a plain JavaScript
object. We can implement the fields we need for our game and leave the other fields out. fields we
don't implement will use default implementation.

### type: `string`

**Required**

Every game configuration should have an unique type. Player needs to specify the game type when
creating a room and the corresponding game configuration will be associated with the room.

### maxPlayer: `number`

**Default** 10

`maxPlayer` specifies the maximum number of players. It is also used as the room capacity.

### onSetup: `(handle) => object`

| Param  | Type   | description                                    |
| ------ | ------ | ---------------------------------------------- |
| handle | Handle | Utility for accessing and modifying game state |

**Default** noop

`onSetup` is called before a game starts. It is called when a room is created, and when the previous
game ends. `onSetup` is a good place to to prepare for each game, such as loading player's
information from database, prompting players for character and map selections and etc.

If `onSetup` returns an object, it will be used as the initial state. This has the same effect of
calling `handle.setState(<myInitialState>)` in `onSetup`.

`handle.setup()` triggers `onSetup`.

### canStart: `(handle) => boolean`

| Param  | Type   | description                                    |
| ------ | ------ | ---------------------------------------------- |
| handle | Handle | Utility for accessing and modifying game state |

**Default** returns true

`canStart` is used to check if all the preparation are done in order to start a new game. It is
called when the host of the room sends a GAME_START message to server. Return true to indicate game
can be started. False otherwise.

`handle.canStart()` triggers `canStart`.

### onStart: `(handle) => void`

| Param  | Type   | description                                    |
| ------ | ------ | ---------------------------------------------- |
| handle | Handle | Utility for accessing and modifying game state |

**Default** noop

`onStart` is used to set up initial game state. `onStart` is called after game starts. It's also an
ideal place to setup game loops if the game require server run some function every interval.

`handle.startGame()` triggers `onStart`.

### onMessage: `(handle, player, data) => void`

| Param  | Type   | description                                    |
| ------ | ------ | ---------------------------------------------- |
| handle | Handle | Utility for accessing and modifying game state |
| player | string | ID of the player sending the message           |
| data   | any    | Content of the message                         |

**Default** noop

`onMessage` is called when we receive a message from a player. `onMessage` is an ideal candidate for
implementing game logics triggered by player inputs.

`onMessage` is triggered by prisel's internal event emitter.

### onAddPlayer: `(handle, player) => void`

| Param  | Type   | description                                    |
| ------ | ------ | ---------------------------------------------- |
| handle | Handle | Utility for accessing and modifying game state |
| player | string | ID of the player sending the message           |

**Default** noop

`onAddPlayer` is called when a player is added to the room. By default, room will accept any player
as long as the room capacity (defined by `maxPlayer` of game configuration) has not been reach and
no game is running in the room. If the room is full or a game is already started, Join request will
be automatically declined, and `onAddPlayer` will not be called.

`handle.addPlayer(player)` triggers `onAddPlayer`.

### onRemovePlayer: `(handle, player) => void`

| Param  | Type   | description                                    |
| ------ | ------ | ---------------------------------------------- |
| handle | Handle | Utility for accessing and modifying game state |
| player | string | ID of the player sending the message           |

**Default** noop

`onRemovePlayer` is called when a player is removed from the room. Because we have no control over
when a player leave, this function can be called during any lifecycle of game.

`handle.removePlayer(player)` triggers `onRemovePlayer`.

### onEnd: `(handle) => void`

| Param  | Type   | description                                    |
| ------ | ------ | ---------------------------------------------- |
| handle | Handle | Utility for accessing and modifying game state |

**Default** noop

`onEnd` is called when game over is declared. Use this function to announce game result and preserve
some game state. Game state will be cleared after this function.

`handle.endGame()` triggers `onEnd`.

---
