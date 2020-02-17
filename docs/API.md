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

`onMessage` is called when we receive a `MESSAGE` type message from a player. `onMessage` is an
ideal candidate for implementing game logics triggered by player inputs.

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
