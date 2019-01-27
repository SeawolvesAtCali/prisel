[@prisel/server](../README.md) > [Server](../classes/server.md)

# Class: Server

## Hierarchy

**Server**

## Index

### Methods

* [broadcast](server.md#broadcast)
* [close](server.md#close)
* [emit](server.md#emit)
* [register](server.md#register)
* [start](server.md#start)

---

## Methods

<a id="broadcast"></a>

###  broadcast

▸ **broadcast**(roomId: *`any`*, messageType: *`string`*, data: *`any`*): `void`

*Defined in [server.ts:75](https://github.com/SeawolvesAtCali/prisel/blob/4c45c20/packages/server/server.ts#L75)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| roomId | `any` |
| messageType | `string` |
| data | `any` |

**Returns:** `void`

___
<a id="close"></a>

###  close

▸ **close**(): `void`

*Defined in [server.ts:87](https://github.com/SeawolvesAtCali/prisel/blob/4c45c20/packages/server/server.ts#L87)*

**Returns:** `void`

___
<a id="emit"></a>

###  emit

▸ **emit**(client: *`Socket`*, messageType: *`string`*, data: *`any`*): `void`

*Defined in [server.ts:81](https://github.com/SeawolvesAtCali/prisel/blob/4c45c20/packages/server/server.ts#L81)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| client | `Socket` |
| messageType | `string` |
| data | `any` |

**Returns:** `void`

___
<a id="register"></a>

###  register

▸ **register**(game: *[GameConfig](../#gameconfig)*, room?: *[RoomConfig](../#roomconfig)*): `void`

*Defined in [server.ts:71](https://github.com/SeawolvesAtCali/prisel/blob/4c45c20/packages/server/server.ts#L71)*

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| game | [GameConfig](../#gameconfig) | - |
| `Default value` room | [RoomConfig](../#roomconfig) |  BaseRoomConfig |

**Returns:** `void`

___
<a id="start"></a>

###  start

▸ **start**(): `void`

*Defined in [server.ts:24](https://github.com/SeawolvesAtCali/prisel/blob/4c45c20/packages/server/server.ts#L24)*

**Returns:** `void`

___

