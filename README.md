# Monopoly

[![Build Status](https://travis-ci.org/SeawolvesAtCali/Monopoly.svg?branch=master)](https://travis-ci.org/SeawolvesAtCali/Monopoly)

Online Monopoly using socket.io

# Install

make sure you have [node](https://nodejs.org/en/) installed, the recommended version is 9.11.1 and
up.

To install dependencies, run the following command in project root directory:

```
npm install
```

# Test

This project uses [jest](https://facebook.github.io/jest/) as the testing framework.

All the test should be inside `__test__` folder next to the source file. For example, if we have a
file `server/something/testMe.js`, its test should be at `server/something/testMe.test.js`

test file should use the same name as the source file, plus `.test.js` ending.

To run all the test

```
npm test
```

To run just one test file, for example `server/__test__/index.test.js`

```
npm test server/__test__/index.test.js
```

To run a file in watch mode(automatically rerun the test when any related files change)

```
npm test server/__test__/index.test.js -- --watch
```

# Linting

Linting makes sure that the source code follows the same coding style. It's recommend to run linting
with fix to automatically fix fixable linting issues.

```
npm run fix
```

If you just want to see the issues without automatically fixing, you can run

```
npm run lint
```

# Continous Intergration

This project uses Travis CI as continous intergration service. Travis will pick up our project
whenever we have a new commit, our build will run both `npm test` and `npm run lint`. Either one of
them fail will result in a failed build.

# Recommended Visual Studio Code plugin

If you are using Visual Studio Code, it's recommended to install the following extension:

## eslint (search for `dbaeumer.vscode-eslint`) for linting

This extension displays linting issues in the code. Also recommend turning on
`"eslint.autoFixOnSave": true` in Visual Studio Code workspace settings. This runs `fix` for the
current file when save.
