

## Index

### Enumerations

* [GAME_PHASE](enums/game_phase.md)

### Classes

* [Server](classes/server.md)

### Interfaces

* [AnyObject](interfaces/anyobject.md)
* [Client](interfaces/client.md)
* [Context](interfaces/context.md)
* [Room](interfaces/room.md)
* [StateManager](interfaces/statemanager.md)

### Type aliases

* [ClientId](#clientid)
* [GameConfig](#gameconfig)
* [Handler](#handler)
* [Message](#message)
* [RoomConfig](#roomconfig)
* [RoomId](#roomid)
* [wsServer](#wsserver)

### Functions

* [addRoom](#addroom)
* [broadcast](#broadcast)
* [closeSocket](#closesocket)
* [createServer](#createserver)
* [createServerFromHTTPServer](#createserverfromhttpserver)
* [emit](#emit)
* [getBroadcastMessage](#getbroadcastmessage)
* [getClient](#getclient)
* [getConnectionToken](#getconnectiontoken)
* [getCreateRoomSuccess](#getcreateroomsuccess)
* [getFailure](#getfailure)
* [getGameStartSuccess](#getgamestartsuccess)
* [getGameState](#getgamestate)
* [getHandle](#gethandle)
* [getJoinSuccess](#getjoinsuccess)
* [getKickSuccess](#getkicksuccess)
* [getLeaveSuccess](#getleavesuccess)
* [getLoginSuccess](#getloginsuccess)
* [getMessage](#getmessage)
* [getReadySuccess](#getreadysuccess)
* [getRoom](#getroom)
* [getRoomUpdate](#getroomupdate)
* [getSuccess](#getsuccess)
* [getWelcome](#getwelcome)
* [handleChat](#handlechat)
* [handleCreateRoom](#handlecreateroom)
* [handleDisconnect](#handledisconnect)
* [handleExit](#handleexit)
* [handleJoin](#handlejoin)
* [handleLeave](#handleleave)
* [handleLogin](#handlelogin)
* [newId](#newid)
* [parseId](#parseid)
* [updateClientWithRoomData](#updateclientwithroomdata)
* [watchForDisconnection](#watchfordisconnection)

### Object literals

* [BaseGameConfig](#basegameconfig)
* [BaseRoomConfig](#baseroomconfig)

---

## Type aliases

<a id="clientid"></a>

###  ClientId

**Ƭ ClientId**: *`string`*

*Defined in [objects/client.ts:1](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/objects/client.ts#L1)*

___
<a id="gameconfig"></a>

###  GameConfig

**Ƭ GameConfig**: *`Partial`<`FullGameConfig`>*

*Defined in [utils/gameConfig.ts:48](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/gameConfig.ts#L48)*

___
<a id="handler"></a>

###  Handler

**Ƭ Handler**: *`function`*

*Defined in [clientHandlerRegister.ts:3](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/clientHandlerRegister.ts#L3)*

#### Type declaration
▸(context: *[Context](interfaces/context.md)*, socket: *`Socket`*): `function`

**Parameters:**

| Name | Type |
| ------ | ------ |
| context | [Context](interfaces/context.md) |
| socket | `Socket` |

**Returns:** `function`

___
<a id="message"></a>

###  Message

**Ƭ Message**: *[`MessageType`, `object`]*

*Defined in [objects/message.ts:3](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/objects/message.ts#L3)*

___
<a id="roomconfig"></a>

###  RoomConfig

**Ƭ RoomConfig**: *`Partial`<`FullRoomConfig`>*

*Defined in [utils/roomConfig.ts:19](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/roomConfig.ts#L19)*

___
<a id="roomid"></a>

###  RoomId

**Ƭ RoomId**: *`string`*

*Defined in [objects/room.ts:1](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/objects/room.ts#L1)*

___
<a id="wsserver"></a>

###  wsServer

**Ƭ wsServer**: *`Server`*

*Defined in [objects/server.ts:3](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/objects/server.ts#L3)*

___

## Functions

<a id="addroom"></a>

###  addRoom

▸ **addRoom**(context: *[Context](interfaces/context.md)*, roomName: *`string`*): [Room](interfaces/room.md)

*Defined in [utils/stateUtils.ts:51](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/stateUtils.ts#L51)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| context | [Context](interfaces/context.md) |
| roomName | `string` |

**Returns:** [Room](interfaces/room.md)

___
<a id="broadcast"></a>

###  broadcast

▸ **broadcast**(context: *[Context](interfaces/context.md)*, roomId: *`string`*, messageType: *`string`*, data: *`any`*): `void`

*Defined in [utils/networkUtils.ts:72](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/networkUtils.ts#L72)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| context | [Context](interfaces/context.md) |
| roomId | `string` |
| messageType | `string` |
| data | `any` |

**Returns:** `void`

___
<a id="closesocket"></a>

###  closeSocket

▸ **closeSocket**(socket: *`WebSocket`*): `void`

*Defined in [utils/networkUtils.ts:85](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/networkUtils.ts#L85)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| socket | `WebSocket` |

**Returns:** `void`

___
<a id="createserver"></a>

###  createServer

▸ **createServer**(__namedParameters: *`object`*): [wsServer](#wsserver)

*Defined in [utils/networkUtils.ts:8](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/networkUtils.ts#L8)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| __namedParameters | `object` |

**Returns:** [wsServer](#wsserver)

___
<a id="createserverfromhttpserver"></a>

###  createServerFromHTTPServer

▸ **createServerFromHTTPServer**(httpServer: *`Server`*): [wsServer](#wsserver)

*Defined in [utils/networkUtils.ts:20](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/networkUtils.ts#L20)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| httpServer | `Server` |

**Returns:** [wsServer](#wsserver)

___
<a id="emit"></a>

###  emit

▸ **emit**(client: *`WebSocket`*, messageType: *`string`*, data: *`any`*): `void`

*Defined in [utils/networkUtils.ts:65](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/networkUtils.ts#L65)*

Utility functions to perform network calls.

**Parameters:**

| Name | Type |
| ------ | ------ |
| client | `WebSocket` |
| messageType | `string` |
| data | `any` |

**Returns:** `void`

___
<a id="getbroadcastmessage"></a>

###  getBroadcastMessage

▸ **getBroadcastMessage**(username: *`string`*, message: *`string`*): [Message](#message)

*Defined in [message/chat.ts:4](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/message/chat.ts#L4)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| username | `string` |
| message | `string` |

**Returns:** [Message](#message)

___
<a id="getclient"></a>

###  getClient

▸ **getClient**(context: *[Context](interfaces/context.md)*, client: *`Socket`*): [Client](interfaces/client.md)

*Defined in [utils/stateUtils.ts:14](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/stateUtils.ts#L14)*

Get the client from the StateManager using client's socket connection.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| context | [Context](interfaces/context.md) |  \- |
| client | `Socket` |   |

**Returns:** [Client](interfaces/client.md)

___
<a id="getconnectiontoken"></a>

###  getConnectionToken

▸ **getConnectionToken**(): `ConnectionToken`

*Defined in [utils/networkUtils.ts:31](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/networkUtils.ts#L31)*

**Returns:** `ConnectionToken`

___
<a id="getcreateroomsuccess"></a>

###  getCreateRoomSuccess

▸ **getCreateRoomSuccess**(roomId: *`string`*): [`MessageType`, `object`]

*Defined in [message/room.ts:66](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/message/room.ts#L66)*

Success response for client creating room

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| roomId | `string` |   |

**Returns:** [`MessageType`, `object`]

___
<a id="getfailure"></a>

###  getFailure

▸ **getFailure**(action: *`MessageType`*, error: *`string`*): [Message](#message)

*Defined in [message/room.ts:19](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/message/room.ts#L19)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| action | `MessageType` |
| error | `string` |

**Returns:** [Message](#message)

___
<a id="getgamestartsuccess"></a>

###  getGameStartSuccess

▸ **getGameStartSuccess**(): [`MessageType`, `object`]

*Defined in [message/room.ts:59](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/message/room.ts#L59)*

Host start the game

**Returns:** [`MessageType`, `object`]

___
<a id="getgamestate"></a>

###  getGameState

▸ **getGameState**(gameState: *`object`*): [Message](#message)

*Defined in [message/game.ts:7](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/message/game.ts#L7)*

Update client on current game state

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| gameState | `object` |   |

**Returns:** [Message](#message)

___
<a id="gethandle"></a>

###  getHandle

▸ **getHandle**(context: *[Context](interfaces/context.md)*, client: *`Socket`*): `Handle`

*Defined in [utils/stateUtils.ts:44](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/stateUtils.ts#L44)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| context | [Context](interfaces/context.md) |
| client | `Socket` |

**Returns:** `Handle`

___
<a id="getjoinsuccess"></a>

###  getJoinSuccess

▸ **getJoinSuccess**(): [`MessageType`, `object`]

*Defined in [message/room.ts:33](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/message/room.ts#L33)*

Success response for client joining room

**Returns:** [`MessageType`, `object`]

___
<a id="getkicksuccess"></a>

###  getKickSuccess

▸ **getKickSuccess**(): [`MessageType`, `object`]

*Defined in [message/room.ts:46](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/message/room.ts#L46)*

Host successfully kick a user out of the room

**Returns:** [`MessageType`, `object`]

___
<a id="getleavesuccess"></a>

###  getLeaveSuccess

▸ **getLeaveSuccess**(): [`MessageType`, `object`]

*Defined in [message/room.ts:40](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/message/room.ts#L40)*

Success response for client leaving room

**Returns:** [`MessageType`, `object`]

___
<a id="getloginsuccess"></a>

###  getLoginSuccess

▸ **getLoginSuccess**(userId: *`string`*): [`MessageType`, `object`]

*Defined in [message/room.ts:27](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/message/room.ts#L27)*

Success response for client login

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| userId | `string` |   |

**Returns:** [`MessageType`, `object`]

___
<a id="getmessage"></a>

###  getMessage

▸ **getMessage**(data: *`any`*): [Message](#message)

*Defined in [message/room.ts:74](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/message/room.ts#L74)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| data | `any` |

**Returns:** [Message](#message)

___
<a id="getreadysuccess"></a>

###  getReadySuccess

▸ **getReadySuccess**(): [`MessageType`, `object`]

*Defined in [message/room.ts:53](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/message/room.ts#L53)*

Success response for client ready

**Returns:** [`MessageType`, `object`]

___
<a id="getroom"></a>

###  getRoom

▸ **getRoom**(context: *[Context](interfaces/context.md)*, client: *`Socket`*): [Room](interfaces/room.md)

*Defined in [utils/stateUtils.ts:30](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/stateUtils.ts#L30)*

Get the client's room from the StateManager using client's socket connection.

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| context | [Context](interfaces/context.md) |  \- |
| client | `Socket` |   |

**Returns:** [Room](interfaces/room.md)

___
<a id="getroomupdate"></a>

###  getRoomUpdate

▸ **getRoomUpdate**(roomData: *`object`*): [Message](#message)

*Defined in [message/room.ts:70](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/message/room.ts#L70)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| roomData | `object` |

**Returns:** [Message](#message)

___
<a id="getsuccess"></a>

###  getSuccess

▸ **getSuccess**(action: *`MessageType`*, data: *`object`*): [Message](#message)

*Defined in [message/room.ts:15](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/message/room.ts#L15)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| action | `MessageType` |
| data | `object` |

**Returns:** [Message](#message)

___
<a id="getwelcome"></a>

###  getWelcome

▸ **getWelcome**(): [Message](#message)

*Defined in [message/room.ts:11](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/message/room.ts#L11)*

functions to create messages. Each function should return an array. The first parameter of the array is the type of the message, the rest are the content

**Returns:** [Message](#message)

___
<a id="handlechat"></a>

### `<Const>` handleChat

▸ **handleChat**(context: *[Context](interfaces/context.md)*, client: *`Socket`*): `(Anonymous function)`

*Defined in [handler/handleChat.ts:8](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/handler/handleChat.ts#L8)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| context | [Context](interfaces/context.md) |
| client | `Socket` |

**Returns:** `(Anonymous function)`

___
<a id="handlecreateroom"></a>

### `<Const>` handleCreateRoom

▸ **handleCreateRoom**(context: *[Context](interfaces/context.md)*, socket: *`Socket`*): `(Anonymous function)`

*Defined in [handler/handleCreateRoom.ts:15](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/handler/handleCreateRoom.ts#L15)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| context | [Context](interfaces/context.md) |
| socket | `Socket` |

**Returns:** `(Anonymous function)`

___
<a id="handledisconnect"></a>

### `<Const>` handleDisconnect

▸ **handleDisconnect**(context: *[Context](interfaces/context.md)*, socket: *`Socket`*): `(Anonymous function)`

*Defined in [handler/handleDisconnect.ts:9](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/handler/handleDisconnect.ts#L9)*

Handles client disconnection when client disconnects unexpectedly

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| context | [Context](interfaces/context.md) |  \- |
| socket | `Socket` |   |

**Returns:** `(Anonymous function)`

___
<a id="handleexit"></a>

### `<Const>` handleExit

▸ **handleExit**(context: *[Context](interfaces/context.md)*, socket: *`Socket`*): `(Anonymous function)`

*Defined in [handler/handleExit.ts:7](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/handler/handleExit.ts#L7)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| context | [Context](interfaces/context.md) |
| socket | `Socket` |

**Returns:** `(Anonymous function)`

___
<a id="handlejoin"></a>

### `<Const>` handleJoin

▸ **handleJoin**(context: *[Context](interfaces/context.md)*, socket: *`Socket`*): `(Anonymous function)`

*Defined in [handler/handleJoin.ts:12](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/handler/handleJoin.ts#L12)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| context | [Context](interfaces/context.md) |
| socket | `Socket` |

**Returns:** `(Anonymous function)`

___
<a id="handleleave"></a>

### `<Const>` handleLeave

▸ **handleLeave**(context: *[Context](interfaces/context.md)*, socket: *`Socket`*): `(Anonymous function)`

*Defined in [handler/handleLeave.ts:8](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/handler/handleLeave.ts#L8)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| context | [Context](interfaces/context.md) |
| socket | `Socket` |

**Returns:** `(Anonymous function)`

___
<a id="handlelogin"></a>

### `<Const>` handleLogin

▸ **handleLogin**(context: *[Context](interfaces/context.md)*, client: *`Socket`*): `(Anonymous function)`

*Defined in [handler/handleLogin.ts:11](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/handler/handleLogin.ts#L11)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| context | [Context](interfaces/context.md) |
| client | `Socket` |

**Returns:** `(Anonymous function)`

___
<a id="newid"></a>

###  newId

▸ **newId**<`T`>(type: *`string`*): `T`

*Defined in [utils/idUtils.ts:7](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/idUtils.ts#L7)*

**Type parameters:**

#### T 
**Parameters:**

| Name | Type |
| ------ | ------ |
| type | `string` |

**Returns:** `T`

___
<a id="parseid"></a>

###  parseId

▸ **parseId**<`T`>(id: *`T`*): `object`

*Defined in [utils/idUtils.ts:16](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/idUtils.ts#L16)*

**Type parameters:**

#### T 
**Parameters:**

| Name | Type |
| ------ | ------ |
| id | `T` |

**Returns:** `object`

___
<a id="updateclientwithroomdata"></a>

### `<Const>` updateClientWithRoomData

▸ **updateClientWithRoomData**(context: *[Context](interfaces/context.md)*, roomId: *`string`*): `void`

*Defined in [utils/updateUtils.ts:12](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/updateUtils.ts#L12)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| context | [Context](interfaces/context.md) |
| roomId | `string` |

**Returns:** `void`

___
<a id="watchfordisconnection"></a>

###  watchForDisconnection

▸ **watchForDisconnection**(socket: *`WebSocket`*, connectionToken: *`ConnectionToken`*): `Promise`<`Object`>

*Defined in [utils/networkUtils.ts:43](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/networkUtils.ts#L43)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| socket | `WebSocket` |
| connectionToken | `ConnectionToken` |

**Returns:** `Promise`<`Object`>

___

## Object literals

<a id="basegameconfig"></a>

### `<Const>` BaseGameConfig

**BaseGameConfig**: *`object`*

*Defined in [utils/gameConfig.ts:50](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/gameConfig.ts#L50)*

<a id="basegameconfig.maxplayers"></a>

####  maxPlayers

**● maxPlayers**: *`number`* = 10

*Defined in [utils/gameConfig.ts:52](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/gameConfig.ts#L52)*

___
<a id="basegameconfig.type"></a>

####  type

**● type**: *`string`* = "game"

*Defined in [utils/gameConfig.ts:51](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/gameConfig.ts#L51)*

___
<a id="basegameconfig.canstart"></a>

####  canStart

▸ **canStart**(handle: *`Handle`*): `true`

*Defined in [utils/gameConfig.ts:56](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/gameConfig.ts#L56)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| handle | `Handle` |

**Returns:** `true`

___
<a id="basegameconfig.onaddplayer"></a>

####  onAddPlayer

▸ **onAddPlayer**(handle: *`Handle`*, player: *`string`*): `void`

*Defined in [utils/gameConfig.ts:62](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/gameConfig.ts#L62)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| handle | `Handle` |
| player | `string` |

**Returns:** `void`

___
<a id="basegameconfig.onend"></a>

####  onEnd

▸ **onEnd**(handle: *`Handle`*): `void`

*Defined in [utils/gameConfig.ts:60](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/gameConfig.ts#L60)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| handle | `Handle` |

**Returns:** `void`

___
<a id="basegameconfig.onmessage"></a>

####  onMessage

▸ **onMessage**(handle: *`Handle`*, player: *`string`*, data: *`any`*): `void`

*Defined in [utils/gameConfig.ts:61](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/gameConfig.ts#L61)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| handle | `Handle` |
| player | `string` |
| data | `any` |

**Returns:** `void`

___
<a id="basegameconfig.onremoveplayer"></a>

####  onRemovePlayer

▸ **onRemovePlayer**(handle: *`Handle`*, player: *`string`*): `void`

*Defined in [utils/gameConfig.ts:63](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/gameConfig.ts#L63)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| handle | `Handle` |
| player | `string` |

**Returns:** `void`

___
<a id="basegameconfig.onsetup"></a>

####  onSetup

▸ **onSetup**(handle: *`Handle`*): `object`

*Defined in [utils/gameConfig.ts:53](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/gameConfig.ts#L53)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| handle | `Handle` |

**Returns:** `object`

___
<a id="basegameconfig.onstart"></a>

####  onStart

▸ **onStart**(handle: *`Handle`*): `void`

*Defined in [utils/gameConfig.ts:59](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/gameConfig.ts#L59)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| handle | `Handle` |

**Returns:** `void`

___

___
<a id="baseroomconfig"></a>

### `<Const>` BaseRoomConfig

**BaseRoomConfig**: *`object`*

*Defined in [utils/roomConfig.ts:21](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/roomConfig.ts#L21)*

<a id="baseroomconfig.type"></a>

####  type

**● type**: *`string`* = "room"

*Defined in [utils/roomConfig.ts:22](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/roomConfig.ts#L22)*

___
<a id="baseroomconfig.oncreate"></a>

####  onCreate

▸ **onCreate**(handle: *`Handle`*, client: *`string`*, data: *`any`*): `void`

*Defined in [utils/roomConfig.ts:23](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/roomConfig.ts#L23)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| handle | `Handle` |
| client | `string` |
| data | `any` |

**Returns:** `void`

___
<a id="baseroomconfig.ongamestart"></a>

####  onGameStart

▸ **onGameStart**(handle: *`Handle`*, client: *`string`*, data: *`any`*): `void`

*Defined in [utils/roomConfig.ts:50](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/roomConfig.ts#L50)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| handle | `Handle` |
| client | `string` |
| data | `any` |

**Returns:** `void`

___
<a id="baseroomconfig.onjoin"></a>

####  onJoin

▸ **onJoin**(handle: *`Handle`*, client: *`string`*, data: *`any`*): `void`

*Defined in [utils/roomConfig.ts:29](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/roomConfig.ts#L29)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| handle | `Handle` |
| client | `string` |
| data | `any` |

**Returns:** `void`

___
<a id="baseroomconfig.onleave"></a>

####  onLeave

▸ **onLeave**(handle: *`Handle`*, client: *`string`*, data: *`any`*): `void`

*Defined in [utils/roomConfig.ts:41](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/roomConfig.ts#L41)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| handle | `Handle` |
| client | `string` |
| data | `any` |

**Returns:** `void`

___
<a id="baseroomconfig.onmessage"></a>

####  onMessage

▸ **onMessage**(handle: *`Handle`*, client: *`string`*, data: *`any`*): `void`

*Defined in [utils/roomConfig.ts:64](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/utils/roomConfig.ts#L64)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| handle | `Handle` |
| client | `string` |
| data | `any` |

**Returns:** `void`

___

___

