/* eslint-disable */

export const protobufPackage = 'prisel'

export enum SystemActionType {
  UNSPECIFIED = 0,
  WELCOME = 1,
  LOGIN = 2,
  JOIN = 3,
  CREATE_ROOM = 4,
  LEAVE = 5,
  EXIT = 6,
  GAME_START = 7,
  CHAT = 8,
  BROADCAST = 9,
  ROOM_STATE_CHANGE = 10,
  ANNOUNCE_GAME_START = 11,
  ERROR = 12,
  GET_ROOM_STATE = 13,
  GET_LOBBY_STATE = 14,
}

export function systemActionTypeFromJSON(object: any): SystemActionType {
  switch (object) {
    case 0:
    case "UNSPECIFIED":
      return SystemActionType.UNSPECIFIED;
    case 1:
    case "WELCOME":
      return SystemActionType.WELCOME;
    case 2:
    case "LOGIN":
      return SystemActionType.LOGIN;
    case 3:
    case "JOIN":
      return SystemActionType.JOIN;
    case 4:
    case "CREATE_ROOM":
      return SystemActionType.CREATE_ROOM;
    case 5:
    case "LEAVE":
      return SystemActionType.LEAVE;
    case 6:
    case "EXIT":
      return SystemActionType.EXIT;
    case 7:
    case "GAME_START":
      return SystemActionType.GAME_START;
    case 8:
    case "CHAT":
      return SystemActionType.CHAT;
    case 9:
    case "BROADCAST":
      return SystemActionType.BROADCAST;
    case 10:
    case "ROOM_STATE_CHANGE":
      return SystemActionType.ROOM_STATE_CHANGE;
    case 11:
    case "ANNOUNCE_GAME_START":
      return SystemActionType.ANNOUNCE_GAME_START;
    case 12:
    case "ERROR":
      return SystemActionType.ERROR;
    case 13:
    case "GET_ROOM_STATE":
      return SystemActionType.GET_ROOM_STATE;
    case 14:
    case "GET_LOBBY_STATE":
      return SystemActionType.GET_LOBBY_STATE;
    default:
      throw new globalThis.Error("Unrecognized enum value " + object + " for enum SystemActionType");
  }
}

export function systemActionTypeToJSON(object: SystemActionType): string {
  switch (object) {
    case SystemActionType.UNSPECIFIED:
      return "UNSPECIFIED";
    case SystemActionType.WELCOME:
      return "WELCOME";
    case SystemActionType.LOGIN:
      return "LOGIN";
    case SystemActionType.JOIN:
      return "JOIN";
    case SystemActionType.CREATE_ROOM:
      return "CREATE_ROOM";
    case SystemActionType.LEAVE:
      return "LEAVE";
    case SystemActionType.EXIT:
      return "EXIT";
    case SystemActionType.GAME_START:
      return "GAME_START";
    case SystemActionType.CHAT:
      return "CHAT";
    case SystemActionType.BROADCAST:
      return "BROADCAST";
    case SystemActionType.ROOM_STATE_CHANGE:
      return "ROOM_STATE_CHANGE";
    case SystemActionType.ANNOUNCE_GAME_START:
      return "ANNOUNCE_GAME_START";
    case SystemActionType.ERROR:
      return "ERROR";
    case SystemActionType.GET_ROOM_STATE:
      return "GET_ROOM_STATE";
    case SystemActionType.GET_LOBBY_STATE:
      return "GET_LOBBY_STATE";
    default:
      return "UNKNOWN";
  }
}
