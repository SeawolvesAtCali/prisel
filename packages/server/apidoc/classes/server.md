[@prisel/server](../README.md) > [Server](../classes/server.md)

# Class: Server

Server is a wrapper on top of the websocket server. It provides utilities to control the server lifecycle.

To create a server, simply call the constructor

```js
import { Server } from '@prisel/server';
const server = new Server();
// Calling server.start() starts the server
server.start();
```

## Hierarchy

**Server**

## Index

### Methods

* [close](server.md#close)
* [register](server.md#register)
* [start](server.md#start)

---

## Methods

<a id="close"></a>

###  close

▸ **close**(): `void`

*Defined in [server.ts:101](https://github.com/SeawolvesAtCali/prisel/blob/cb69e5a/packages/server/server.ts#L101)*

Close the server. After a server is closed, it cannot be restarted. If we need to start a new server, a new Server instance needs to be created.

**Returns:** `void`

___
<a id="register"></a>

###  register

▸ **register**(game: *[GameConfig](../#gameconfig)*, room?: *[RoomConfig](../#roomconfig)*): `void`

*Defined in [server.ts:93](https://github.com/SeawolvesAtCali/prisel/blob/cb69e5a/packages/server/server.ts#L93)*

Register a game to the server. If the game requires special room configuration, a room configuration can also be provided.

**Parameters:**

| Name | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| game | [GameConfig](../#gameconfig) | - |  game configuration. |
| `Default value` room | [RoomConfig](../#roomconfig) |  BaseRoomConfig |  room configuration, if not provided, the base room configuration will be used. |

**Returns:** `void`

___
<a id="start"></a>

###  start

▸ **start**(): `void`

*Defined in [server.ts:40](https://github.com/SeawolvesAtCali/prisel/blob/cb69e5a/packages/server/server.ts#L40)*

Start the server and setup listeners for websocket events.

**Returns:** `void`

___

