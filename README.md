# prisel

[![Build Status](https://travis-ci.org/SeawolvesAtCali/prisel.svg?branch=master)](https://travis-ci.org/SeawolvesAtCali/prisel)
[![License](https://img.shields.io/npm/l/@prisel/server.svg)](https://www.npmjs.com/package/@prisel/server)
[![version](https://img.shields.io/npm/v/@prisel/server.svg)](https://www.npmjs.com/package/@prisel/server)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

(WIP) Monopoly game built with TypeScript.

![screenshot](https://user-images.githubusercontent.com/5957726/80856433-de8da400-8bfe-11ea-9d08-3b6411664615.png)

# Development

## Installation

The main part of the project can be built inside dev container or locally. If you have
[Visual Studio Code](https://code.visualstudio.com/), it's recommended to set up remote development
following the following step:

1. Pull down this repo.
1. Use `npm ci` to install packages.
1. Use `npm run build` to build packages.
1. Install Docker Desktop 2.0+ on Windows or macOS or Docker CE/EE 18.06+ as required by
   [this doc](https://code.visualstudio.com/docs/remote/containers#_system-requirements).
1. Install VSCode
   [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
   extension.
1. Run `Remote-Containers: Open Folder in Container...` command from Command Palette(`F1`) and
   select the cloned priesl folder
1. When container starts, it will run `npm ci` to install all dependencies
1. Install [CocosDashboard](https://docs.cocos.com/creator/manual/en/getting-started/dashboard.html)
   and use it to download [CocosCreator 2.3.2](cocos-dashboard://download/2d_2.3.2). Both
   CocosDashboard and CocosCreator should be installed in your local environment. After that you can
   use CocosCreator to open the game project in `packages/monopoly-client/project.json`

@prisel/monopoly-client is built using CocosCreator-2.3.2, because Cocos Creator is a GUI
application, it cannot run in container.

## Running

### run server

```
npm run start:monopoly-server
```

This will run on port 3000

### run client

In CocosCreator, click the run
button![run
button](https://user-images.githubusercontent.com/5957726/80856203-a9805200-8bfc-11ea-8afb-0de2bf5fcd81.png)

### run demo docker containers

I have packaged the server and clients in docker containers `prisel/monopoly-server` and
`prisel/monopoly-client`. To run a local demo, we can simply use docker compose in project root
directory:

```bash
docker-compose up -d
```

To see the logs

```bash
docker-compose logs -f
```

To turn down the servers

```bash
docker-compose down
```
