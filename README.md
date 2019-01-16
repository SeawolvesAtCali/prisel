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

`Handle` is a collection of utilities to access/modify the game/room state and send messages to
clients. All game and room functions have access to `Handle`.

More detail on [Handle's API doc](#handle-1)

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

## Handle

Handle is an object created by prisel and supplied to each room. Use handle to access the state of
room and communicate with client. Handle is stateless and immutable. We shouldn't modify the
properties on a handle.

Handle has the following properties:

### `emit`

`handle.emit(playerId: string, data: any) => void`

Emit a message to a player with `MESSAGE` type. `MESSAGE` type is not used by prisel internally. We
can use it to implement our communication protocol.

`handle.emit(playerId: string, messageType: string, data: any) => void`

Emit a message to a player with the given message type. Check the message list for all available
message types and when to emit them.

### `broadcast`

`handle.broadcast(playerIds: string[], data: any) => void`

Broadcast a message to every player in the playerIds array with `MESSAGE` type. `MESSAGE` type is
not used by prisel internally. We can use it to implement our communication protocol.

`handle.broadcast(playerIds: string[], messageType: string, data: any) => void`

Broadcast a message to every player in the playerIds array with the given message type. Check the
message list for all available message types and when to emit them.

### `broadcastRoomUpdate`

`handle.broadcastRoomUpdate() => void`

Broadcast to every player in the room the latest state of room. Room state includes basic room
information and players' information. Use this

### `state`

`handle.state`

`state` is the game state. `state` is immutable, meaning, if we assign `handle.state` to a variable,
whenever state changes throgh `setState`, the variable still holds the old state. Modifying state
directly will cause unexpected result. All modification to state should go through `setState`.

### `setState`

`handle.setState(partialState: object) => object`

Set the current game state with a new state. New state will be shallowly merged with the current
state. The result state is also returned.

| original state        | new state               | result state                  |
| --------------------- | ----------------------- | ----------------------------- |
| `{color: 'yellow'}`   | `{value: 1}`            | `{color: 'yellow', value: 1}` |
| `{life: 50}`          | `{life: 'alive'}`       | `{life: 'alive'}`             |
| `{weapon: { gun: 1}}` | `{weapon: { knife: 2}}` | `{weapon: {knife: 2}}`        |

`handle.setState((draftState) => void) => object`

`setState` can also takes a producer function. Producer function will receive a draft of the current
game state. Any modification to the draft will be recorded and the state will be updated after
`setState`. state won't be updated inside the producer. `setState` internally uses
[immer](https://github.com/mweststrate/immer) so any
[limitation with immer](https://github.com/mweststrate/immer#pitfalls) also applies.

### `clearState`

`handle.clearState() => void`

Clear the game state. This essentially sets state to empty object `{}`.

### `canStart`

`handle.canStart() => boolean`

Calls `canStart` method on the game configuration and return true/false for if we can start a game.

### `startGame`

`handle.startGame() => void`

Update room's game phase to `GAME_PHASE.GAME`. `startGame` also calls `start` method on the game
configuration.

### `endGame`

`handle.endGame() => void`

Update room's game phase to `GAME_PHASE.WAITING`. `endGame` also calls `end` method on the game
configuration.

### `gamePhase`

`handle.gamePhase`

Get the game phase of the room. Game phase is an enum that can be `GAME_PHASE.GAME` or
`GAME_PHASE.WAITING`.

`GAME_PHASE.GAME`: A game is running.

`GAME_PHASE.WAITING`: No game is running.

### `addPlayer`

`handle.addPlayer(playerId: string) => void`

Add a player to the room. Calls `onAddPlayer` on the game configuration after the player is added.

### `removePlayer`

`handle.removePlayer(playerId: string) => void`

Remove a player from the room. Calls `onRemovePlayer` on the game configuration after the player is
removed.

### `players`

`handle.players`

An array of player IDs for all players in the room.

### `removeRoom`

`handle.removeRoom() => void`

Remove the current room. When room is removed, the handle become unusable.

### `host`

`handle.host`

The player Id of the host in the room. Host has the priviledge to start a game.

### `setHost`

`handle.setHost(hostId: string) => void`

Set the host of the room using the host's player Id.

## Room

Prisel provides a default room implementation. If we need to extend or override the default logic,
we can provide a room configuration. Similar to game configuration. Room's configuration is also a
plain JavaScript objects. We can implement the fields we need for our room and leave the other
fields out. fields we don't implement will use default implementation.

Room configuration are modelled after the message types player sends. Upon receiving a message from
an authorized player, the corresponding method on the room configuration will be called.

Room configuration has following fields:

### type: `string`

**Required**

Every room configuration should have an unique type. When player specifies a room type when creating
a room. The corresponding room configuration will be associated with the room.

### onCreate: `(handle: Handle, playerId: string, data: any) => void`

`onCreate` is called upon receiving `CREATE_ROOM` message from a player. Prisel verifies that the
player is not already in a room.

#### default

-   Add the player to the room as a host
-   Reply the player with message type `SUCCESS` and payload `{action: 'JOIN'}`
-   Broadcast to everyone in the room the updated room state.

### onJoin: `(handle: Handle, playerId: string, data: any) => void`

`onJoin` is called upon receiving `JOIN` message from a player. Prisel verifies that the player is
not already in a room.

#### default

-   Add the player to the room as a guest
-   Reply the player with message type `SUCCESS` and payload `{action: 'JOIN'}`
-   Broadcast to everyone in the room the the updated room state.

### onLeave: `(handle: Handle, playerId: string, data: any) => void`

`onLeave` is called when player sends a `LEAVE` message. Prisel verifies that the player is in a
room. If the last player leaves a room, the room will be destroyed.

#### default

-   Remove the player from the room.
-   If host left, set the first player in the room as the new host.
-   Reply the player with message type `SUCCESS` and payload `{action: 'LEAVE'}`
-   Broadcast to everyone in the room with the updated room state.

### onGameStart: `(handle: Handle, playerId: string, data: any) => void`

`onGameStart` is called when a player sends a `GAME_START` message. Prisel verifies that the player
is in a room and a game has not started in the room.

#### default

-   Reply the player with message type `FAILURE` and payload `{action: 'GAME_START'}` if the player
    is not the host of the room.
-   Broadcast to everyone in the room with message type `SUCCESS` and payload
    `{action: 'GAME_START'}`

### onMessage: `(handle: Handle, playerId: string, data: any) => void`

`onMessage` is called when receiving `ROOM_MESSAGE` type message.

#### default

-   Do nothing.
