# prisel

[![Build Status](https://travis-ci.org/SeawolvesAtCali/prisel.svg?branch=master)](https://travis-ci.org/SeawolvesAtCali/prisel)
[![License](https://img.shields.io/npm/l/@prisel/server.svg)](https://www.npmjs.com/package/@prisel/server)
[![version](https://img.shields.io/npm/v/@prisel/server.svg)](https://www.npmjs.com/package/@prisel/server)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

WebSocket game engine with a focus on room management.

# Guiding principles

This project is being developed with the following principle in mind:

1. **Robust and opinionated room system** It should provide a room system with reasonable defaults,
   but also customizable.
2. **Total freedom of game logic implementation** It should be totally unopinionated on how/when to
   store state and how/when to synchronize with the client.
3. **Client side technology agnostic** It should not require a corresponding client engine. Client
   server communication should be based on raw WebSocket with clearly defined messages, so that
   client can be built in any language with ease.
4. **Develop server in JavaScript or TypeScript** Although the project is developed in TypeScript,
   user should have the freedom to use it with either JavaScript or TypeScript.
5. **Testing and debugging support** It should provide good testing and debugging utilities.

---

# Contributor guide

## Install

make sure you have [node](https://nodejs.org/en/) installed, the recommended version is 10.x and up.

To install dependencies, run the following command in project root directory:

```
npm install
```

## Test

This project uses [jest](https://facebook.github.io/jest/) as the testing framework.

All the test should be inside `__test__` folder next to the source file. For example, if we have a
file `directory/testMe.ts`, its test should be at `directory/__test__/testMe.test.ts`

test file should use the same name as the source file, plus `.test.js` ending.

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
whenever we have a new commit, our build will run both `npm test` and `npm run lint`. Either one of
them fail will result in a failed build.

## Deploying

The server package is deployed to heroku at
[https://game-server-monopoly.herokuapp.com/](https://game-server-monopoly.herokuapp.com/).

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

If you need to make change to Heroku, ask @yiochen for credential.

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
