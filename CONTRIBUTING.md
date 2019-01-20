# Contributing to prisel

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
