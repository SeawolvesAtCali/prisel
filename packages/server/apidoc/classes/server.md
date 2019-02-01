[@prisel/server](../README.md) > [Server](../classes/server.md)

# Class: Server

Server is a wrapper on top of the websocket server. It provides utilities to control the server lifecycle.

To create a server, simply call the constructor.

```js
import { Server } from '@prisel/server';
const server = new Server(); // By default a new server is started at localhost:3000
```

We can also specify the hostname and port number.

```js
const server = new Server({host: '0.0.0.0', port: 3000});
```

By default, prisel uses [koa](https://koajs.com/) for the underlying HTTP server, to use an existing server instead, we can specify the server property.

```js
// use an express server.
import express from 'express';
import http from 'http';

const app = express();
const expressServer = http.createServer(express);
const server = new Server({server: expressServer});
```

## Hierarchy

**Server**

## Index

### Constructors

* [constructor](server.md#constructor)

### Methods

* [close](server.md#close)
* [register](server.md#register)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Server**(config?: *`Pick`<`ServerConfig`, "host" \| "port"> \| `Pick`<`ServerConfig`, "server">*): [Server](server.md)

*Defined in [server.ts:59](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/server.ts#L59)*

Create and start the server and setup listeners for websocket events.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `Default value` config | `Pick`<`ServerConfig`, "host" \| "port"> \| `Pick`<`ServerConfig`, "server"> |  {host: &#x27;localhost&#x27;,port: 3000,} |  configuration for the underlying HTTP Server. If not provided, a [koa](https://koajs.com/) server will be created at localhost:3000. |

**Returns:** [Server](server.md)

___

## Methods

<a id="close"></a>

###  close

▸ **close**(): `void`

*Defined in [server.ts:133](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/server.ts#L133)*

Close the server. After a server is closed, it cannot be restarted. If we need to start a new server, instantiate a new Server.

**Returns:** `void`

___
<a id="register"></a>

###  register

▸ **register**(game: *[GameConfig](../#gameconfig)*, room?: *[RoomConfig](../#roomconfig)*): `void`

*Defined in [server.ts:125](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/server.ts#L125)*

Register a game to the server. If the game requires special room configuration, a room configuration can also be provided.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| game | [GameConfig](../#gameconfig) | - |  game configuration. |
| `Default value` room | [RoomConfig](../#roomconfig) |  BaseRoomConfig |  room configuration, if not provided, the base room configuration will be used. |

**Returns:** `void`

___

