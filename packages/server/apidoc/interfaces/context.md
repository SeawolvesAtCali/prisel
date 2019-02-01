[@prisel/server](../README.md) > [Context](../interfaces/context.md)

# Interface: Context

## Hierarchy

**Context**

## Index

### Properties

* [SocketManager](context.md#socketmanager)
* [StateManager](context.md#statemanager)
* [getConfigs](context.md#getconfigs)
* [handles](context.md#handles)
* [server](context.md#server)
* [updateState](context.md#updatestate)

---

## Properties

<a id="socketmanager"></a>

###  SocketManager

**● SocketManager**: *`SocketManager`*

*Defined in [objects/context.ts:10](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/objects/context.ts#L10)*

___
<a id="statemanager"></a>

###  StateManager

**● StateManager**: *[StateManager](statemanager.md)*

*Defined in [objects/context.ts:11](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/objects/context.ts#L11)*

___
<a id="getconfigs"></a>

### `<Optional>` getConfigs

**● getConfigs**: *`function`*

*Defined in [objects/context.ts:19](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/objects/context.ts#L19)*

#### Type declaration
▸(gameType: *`string`*, roomType?: *`string`*): `object`

**Parameters:**

| Name | Type |
| ------ | ------ |
| gameType | `string` |
| `Optional` roomType | `string` |

**Returns:** `object`

___
<a id="handles"></a>

###  handles

**● handles**: *`object`*

*Defined in [objects/context.ts:13](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/objects/context.ts#L13)*

#### Type declaration

[roomId: `string`]: `Handle`

___
<a id="server"></a>

###  server

**● server**: *[wsServer](../#wsserver)*

*Defined in [objects/context.ts:12](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/objects/context.ts#L12)*

___
<a id="updatestate"></a>

###  updateState

**● updateState**: *`function`*

*Defined in [objects/context.ts:16](https://github.com/SeawolvesAtCali/prisel/blob/4f2b043/packages/server/objects/context.ts#L16)*

#### Type declaration
▸(updater: *`function`*): [StateManager](statemanager.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| updater | `function` |

**Returns:** [StateManager](statemanager.md)

___

