[@prisel/server](../README.md) > [ConfigManager](../classes/configmanager.md)

# Class: ConfigManager

## Hierarchy

**ConfigManager**

## Index

### Methods

* [add](configmanager.md#add)
* [get](configmanager.md#get)

---

## Methods

<a id="add"></a>

###  add

▸ **add**(gameConfig: *[GameConfig](../#gameconfig)*, roomConfig: *[RoomConfig](../#roomconfig)*): `void`

*Defined in [utils/configManager.ts:18](https://github.com/SeawolvesAtCali/prisel/blob/363ed4a/packages/server/utils/configManager.ts#L18)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| gameConfig | [GameConfig](../#gameconfig) |
| roomConfig | [RoomConfig](../#roomconfig) |

**Returns:** `void`

___
<a id="get"></a>

###  get

▸ **get**(gameType?: *`string`*, roomType?: *`string`*): `object`

*Defined in [utils/configManager.ts:26](https://github.com/SeawolvesAtCali/prisel/blob/363ed4a/packages/server/utils/configManager.ts#L26)*

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| `Default value` gameType | `string` |  BaseGameConfig.type |
| `Default value` roomType | `string` |  BaseRoomConfig.type |

**Returns:** `object`

___

