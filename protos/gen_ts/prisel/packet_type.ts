/* eslint-disable */

export enum PacketType {
  DEFAULT = 0,
  REQUEST = 1,
  RESPONSE = 2,
}

export function packetTypeFromJSON(object: any): PacketType {
  switch (object) {
    case 0:
    case "DEFAULT":
      return PacketType.DEFAULT;
    case 1:
    case "REQUEST":
      return PacketType.REQUEST;
    case 2:
    case "RESPONSE":
      return PacketType.RESPONSE;
    default:
      throw new Error("Unrecognized enum value " + object + " for enum PacketType");
  }
}

export function packetTypeToJSON(object: PacketType): string {
  switch (object) {
    case PacketType.DEFAULT:
      return "DEFAULT";
    case PacketType.REQUEST:
      return "REQUEST";
    case PacketType.RESPONSE:
      return "RESPONSE";
    default:
      return "UNKNOWN";
  }
}
