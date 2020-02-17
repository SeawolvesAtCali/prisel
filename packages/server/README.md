# @prisel/server

> This project is still in a super early stage. We are still working on the API.

Write simple configurations to describe our game logic and prisel will handle the networking and
user management for us. `@prisel/server` is built on top of WebSocket protocol, we can use any
technology that supports WebSocket to build the client side.

# Install

```
> npm i @prisel/server
```

## Usage

By default, prisel creates a server on port 3000.

```javascript
import { Server } from '@prisel/server';
const server = Server.create(); // server starts at ws://localhost:3000.

server.close(); // close the server;
```

To create a game, we need to implement a game configuration and add to the server.

```javascript
const game = {
    type: 'my-awesome-game',
    maxPlayers: 4, // Limits the room capacity
    canStart: (handle) => {
        // Check if we can start the game.
        // Called before game starts.
        // return true or false (default: `return true`);
    },
    onStart: (handle) => {
        // Initialize game.
        // Called after game starts.
    },
    onMessage: (handle, player, data) => {
        // Handle a game message (player's move).
        // Called when receiving a player message.
    },
    onAddPlayer: (handle, player) => {
        // Initialize the new player's state.
        // Called when a new player is added.
    },
    onRemovePlayer: (handle, player) => {
        // Clean up the removed player's state.
        // Called when a player leaves.
    },
    onEnd: (handle) => {
        // Announce game result.
        // Called when a game ends.
    },
};

server.register(game);
```

We don't have to implement all functions in the configuration. If any of them are left out, the
default implementations will be used, which are empty functions in most case. For example, below is
an implementation of a simple rock-paper-scissors game.

```javascript
const RockPaperScissors = {
    type: 'rock-paper-scissors',
    maxPlayers: 2,
    canStart: (handle) => {
        return handle.players.length === 2;
    },
    onStart: (handle) => {
        handle.setState({
            moves: {},
        });
        console.log('start game!');
    },
    onMessage: (handle, player, data) => {
        const playerMove = data.move;
        handle.setState((draftState) => {
            const moves = draftState.moves;
            if (moves[player] === undefined) {
                moves[player] = playerMove;
            }
        });
        const otherPlayer = handle.players.filter((playerInGame) => playerInGame !== player)[0];
        const otherPlayerMove = handle.state.moves[otherPlayer];
        if (otherPlayerMove !== undefined) {
            const winnerMap = {
                rock: {
                    paper: otherPlayer,
                    scissors: player,
                },
                paper: {
                    rock: player,
                    scissors: otherPlayer,
                },
                scissors: {
                    rock: otherPlayer,
                    paper: player,
                },
            };
            if (playerMove === otherPlayerMove) {
                handle.setState({
                    gameResult: 'tie',
                });
                handle.endGame();
            } else {
                handle.setState({
                    gameResult: `winner: ${winnerMap[playerMove][otherPlayerMove]}`,
                });
            }

            handle.endGame();
        }
    },
    onEnd: (handle) => {
        handle.broadcast(handle.players, { gameResult: handle.state.gameResult });
    },
};

server.register(RockPaperScissors);
```

## Advanced Usage

### Customize room behavior

By default prisel handles creating room, adding/removing players from the room. If we need to
customize the behavior, we can supply a room configuration.

```javascript
const room = {
    type: 'room-for-friends',
    onCreate: (handle, player, data) => {
        // Initialize room state.
        // Called when room is created.
    },
    onJoin: (handle, player, data) => {
        // Add player to the room.
        // Called when receiving a JOIN event from a player who wants to join the room.
    },
    onLeave: (handle, player, data) => {
        // Remove player from the room.
        // Called when receiving a LEAVE event from a a player leaving the room.
    },
    onGameStart: (handle, player, data) => {
        // Check if we can start the game and start the game if we can.
        // Called when receiving a GAME_START event from a player in the room.
    },
    onMessage: (handle, player, data) => {
        // Handle a room message.
        // Called when receiving a ROOM_MESSAGE event from a player in the room.
    },
};

// add the room configuration with a game configuration
server.add(game, room);
```

Similar to game configuration, we can apply a partial room configuration by implementing a subset of
the functions, functions that we left out will use the default implementation. Check the
documentation below for the default behavior for each functions.

### onCreate

-   Add the player to the room.
-   Notify the player on successfully joining the room.
-   Broadcast room state to all players in the room (just one player for now).

### onJoin

-   Add the player to room if a game has not started.
-   Notify the player on joining room with success or failure.
-   Broadcast room state to all players in the room.

### onLeave

-   Remove the player from the room.
-   Notify the player on leaving successfully.
-   Promote the next player to be a host if the host left.
-   Broadcast room state to all players in the room.

### onGameStart

-   Emit failure message to player if the player is not a host.
-   Attempt to start the game.

### onMessage

-   Do nothing.

For example, if we want to implement a room that allows host promoting another player to be the new
host, we can implement use the following configuration:

```javascript
const room = {
    type: 'host-can-promote',
    onMessage: (handle, player, data) => {
        if (data.type === 'PROMOTE' && player === handle.host) {
            const targetPlayer = data.targetPlayer;
            if (handle.players.includes(targetPlayer)) {
                handle.setHost(targetPlayer);
            }
        }
    },
};

// Add the room with a game
server.register(game, room);
```
