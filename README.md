# prisel

[![Build Status](https://travis-ci.org/SeawolvesAtCali/prisel.svg?branch=master)](https://travis-ci.org/SeawolvesAtCali/prisel)
[![License](https://img.shields.io/npm/l/@prisel/server.svg)](https://www.npmjs.com/package/@prisel/server)
[![version](https://img.shields.io/npm/v/@prisel/server.svg)](https://www.npmjs.com/package/@prisel/server)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

Node.js game server for your next multiplayer game.

# Guiding principles

This project is being developed with the following principle in mind:

1. **Robust and opinionated room system** It should provide a room system with reasonable defaults,
   but also customizable.
2. **Freedom of game logic implementation** It should be totally unopinionated on how/when to store
   state and how/when to synchronize with the client.
3. **Client side technology agnostic** It should not require a corresponding client engine. Client
   server communication should be based on raw WebSocket with clearly defined messages, so that
   client can be built in any language with ease.
4. **Develop server in JavaScript or TypeScript** Although the project is developed in TypeScript,
   user should have the freedom to use it with either JavaScript or TypeScript.
5. **Testing and debugging support** It should provide good testing and debugging utilities.

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

# Concept

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

-   [**`onSetup`**](#onSetup)
-   [**`canStart`**](#canStart)

#### Running

-   [**`onStart`**](#onStart)

#### Ending

-   [**`onEnd`**](#onEnd)

Some common APIs for all lifecycles that we can implement are

-   [**`onMessage`**](#onMessage)
-   [**`onAddPlayer`**](#onAddPlayer)
-   [**`onRemovePlayer`**](#onRemovePlayer)

# API

## Game

Game logic are described using a game configuration. Game configuration is a plain JavaScript
object. We can implement the fields we need for our game and leave the other fields out. fields we
don't implement will use default implementation.

### type: `string`

### onSetup: `(handle) => object`

| Param  | Type   | description                                    |
| ------ | ------ | ---------------------------------------------- |
| handle | Handle | Utility for accessing and modifying game state |

**Default** Does nothing

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

**Default** Does nothing

`onStart` is used to set up initial game state. `onStart` is called after game starts. It's also an
ideal place to setup game loops if the game require server run some function every interval.

`handle.startGame()` triggers `onStart`.

### onMessage: `(handle, player, data) => void`

| Param  | Type   | description                                    |
| ------ | ------ | ---------------------------------------------- |
| handle | Handle | Utility for accessing and modifying game state |
| player | string | ID of the player sending the message           |
| data   | any    | Content of the message                         |

**Default** Does nothing

`onMessage` is called when we receive a message from a player. `onMessage` is an ideal candidate for
implementing game logics triggered by player inputs.

`onMessage` is triggered by prisel's internal event emitter.

### onAddPlayer: `(handle, player) => void`

| Param  | Type   | description                                    |
| ------ | ------ | ---------------------------------------------- |
| handle | Handle | Utility for accessing and modifying game state |
| player | string | ID of the player sending the message           |

**Default** Does nothing

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

**Default** Does nothing

`onRemovePlayer` is called when a player is removed from the room. Because we have no control over
when a player leave, this function can be called during any lifecycle of game.

`handle.removePlayer(player)` triggers `onRemovePlayer`.

### onEnd: `(handle) => void`

| Param  | Type   | description                                    |
| ------ | ------ | ---------------------------------------------- |
| handle | Handle | Utility for accessing and modifying game state |

**Default** Does nothing

`onEnd` is called when game over is declared. Use this function to announce game result and preserve
some game state. Game state will be cleared after this function.

`handle.endGame()` triggers `onEnd`.

### Game

---

# Contributing guide

## Project overview

This project uses lerna to manage multiple sub packages inside `/packages` folder.

-   **server** hosts the code for server engine, published as
    [`@prisel/server`](https://www.npmjs.com/package/@prisel/server)
-   **client** hosts the code for client library, published as
    [`@prisel/client`](https://www.npmjs.com/package/@prisel/client)
-   **common** shared code used by server and client, published as
    [`@prisel/common`](https://www.npmjs.com/package/@prisel/common)
-   **template** template for creating a new package in this monorepo
-   **e2e** end to end test for server and client
-   **tic-tac-toe** an example tic-tac-toe server implementation
-   **tic-tac-toe-client** an example tic-tac-toe client implementation

## Install

make sure you have [node](https://nodejs.org/en/) installed, the recommended version is 10.x and up.

To install dependencies, run the following command in project root directory:

```
npm install
```

All the sub packages' dependencies and devDependencies are recorded in top level package-lock.json.
Installing in the top level will make sure all of them are installed.

## Test

This project uses [jest](https://facebook.github.io/jest/) as the testing framework.

All the test should be inside `__test__` folder next to the source file. For example, if we have a
file `directory/testMe.ts`, its test should be at `directory/__test__/testMe.test.ts`

test file should use the same name as the source file, plus `.test.ts` ending.

To run all the test

```
npm test
```

To run a test in a package

```
npm test --scope <package-name>
```

for example:

```
npm test --scope @prisel/server
```

To run a single test file

```
npx jest <test-file-name>
```

for example

```
npx jest handleRoomActions.test.ts
```

## Debugging

This project uses [debug](https://github.com/visionmedia/debug), the same logging library that
Socket.io uses. To enable debugging, set `DEBUG` environment variables before running the script.

For example

```
env DEBUG=debug npm run start:server
```

In the code, we should use `debug` instead of `console.log` for debug messages.

```
const debug = require('debug')('debug'); // Import debug and set the debug message label to `debug`

debug('Hello world'); // This will print "debug: Hello world"
```

Debugging using Visual Studio Code is super easy.

1.  In the debug panel, click on the gear icon to create a `launch.json`.
2.  The content of the json file could be as simple as
    ```
    {
        "version": "0.2.0",
        "configurations": [
            {
                "type": "node",
                "request": "launch",
                "name": "debug server",
                "program": "${workspaceFolder}/server/index.ts"
            }
        ]
    }
    ```
3.  Set a breakpoint in editor
4.  Click on the green run button to start debugging.

## Linting

Linting makes sure that the source code follows the same coding style. It's recommend to run linting
with fix to automatically fix fixable linting issues.

```
npm run fix
```

If you just want to see the issues without automatically fixing, you can run

```
npm run lint
```

## Continous Intergration

This project uses Travis CI as continous intergration service. Travis will pick up our project
whenever we have a new commit, our build will run through all the checks listed in `.travis.yml`.
Any of them fails will result in a failed build.

## Deploying

An example server that serves tic-tac-toe is deployed at
[Heroku](https://game-server-monopoly.herokuapp.com/).

Heroku goes to sleep once in a while, until someone access it. When the server is running, we should
see

```
Server is running
```

on the page.

The corresponding client side is deployed at [Netlify](https://prisel-tic-tac-toe.netlify.com/)

![tic-tac-toe-client](https://user-images.githubusercontent.com/5957726/50565663-f7720680-0ce5-11e9-912f-eab1baee6b93.png)

When a pull request gets merged into master branch, heroku will automatically redeploy. We have the
following configuration set for Heroku

```bash
> heroku config:set NPM_CONFIG_PRODUCTION=false --app game-server-monopoly
```

This make sure that Heroku doesn't do `npm install --production` which causes devDependencies to not
get installed.

```bash
> heroku config:set NODEMODULESCACHE=false --app game-server-monopoly
```

This make sure that Heroku doesn't cache node_modules.

If you need to make change to Heroku or Netlify, ask [@yiochen](https://github.com/yiochen) for
credential.

## Recommended Visual Studio Code plugin

If you are using Visual Studio Code, it's recommended to install the following extension:

### eslint (search for `dbaeumer.vscode-eslint`) for linting

This extension displays linting issues in the code. Also recommend turning on
`"eslint.autoFixOnSave": true` in Visual Studio Code workspace settings. This runs `fix` for the
current file when save.

### tslint (search for `eg2.tslint`) for TypeScript linting

Also recommend enabling `tslint.autoFixOnSave` in vscode setting.

### prettier (search for `esbenp.prettier-vscode`)

Prettier formats the code. On editor setting, enable `editor.formatOnSave`
