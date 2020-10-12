/* eslint-disable */

export const protobufPackage = 'prisel'

export enum MessageType {
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
  UNRECOGNIZED = -1,
}

export function messageTypeFromJSON(object: any): MessageType {
  switch (object) {
    case 0:
    case "UNSPECIFIED":
      return MessageType.UNSPECIFIED;
    case 1:
    case "WELCOME":
      return MessageType.WELCOME;
    case 2:
    case "LOGIN":
      return MessageType.LOGIN;
    case 3:
    case "JOIN":
      return MessageType.JOIN;
    case 4:
    case "CREATE_ROOM":
      return MessageType.CREATE_ROOM;
    case 5:
    case "LEAVE":
      return MessageType.LEAVE;
    case 6:
    case "EXIT":
      return MessageType.EXIT;
    case 7:
    case "GAME_START":
      return MessageType.GAME_START;
    case 8:
    case "CHAT":
      return MessageType.CHAT;
    case 9:
    case "BROADCAST":
      return MessageType.BROADCAST;
    case 10:
    case "ROOM_STATE_CHANGE":
      return MessageType.ROOM_STATE_CHANGE;
    case 11:
    case "ANNOUNCE_GAME_START":
      return MessageType.ANNOUNCE_GAME_START;
    case 12:
    case "ERROR":
      return MessageType.ERROR;
    case 13:
    case "GET_ROOM_STATE":
      return MessageType.GET_ROOM_STATE;
    case 14:
    case "GET_LOBBY_STATE":
      return MessageType.GET_LOBBY_STATE;
    case -1:
    case "UNRECOGNIZED":
    default:
      return MessageType.UNRECOGNIZED;
  }
}

export function messageTypeToJSON(object: MessageType): string {
  switch (object) {
    case MessageType.UNSPECIFIED:
      return "UNSPECIFIED";
    case MessageType.WELCOME:
      return "WELCOME";
    case MessageType.LOGIN:
      return "LOGIN";
    case MessageType.JOIN:
      return "JOIN";
    case MessageType.CREATE_ROOM:
      return "CREATE_ROOM";
    case MessageType.LEAVE:
      return "LEAVE";
    case MessageType.EXIT:
      return "EXIT";
    case MessageType.GAME_START:
      return "GAME_START";
    case MessageType.CHAT:
      return "CHAT";
    case MessageType.BROADCAST:
      return "BROADCAST";
    case MessageType.ROOM_STATE_CHANGE:
      return "ROOM_STATE_CHANGE";
    case MessageType.ANNOUNCE_GAME_START:
      return "ANNOUNCE_GAME_START";
    case MessageType.ERROR:
      return "ERROR";
    case MessageType.GET_ROOM_STATE:
      return "GET_ROOM_STATE";
    case MessageType.GET_LOBBY_STATE:
      return "GET_LOBBY_STATE";
    default:
      return "UNKNOWN";
  }
}
