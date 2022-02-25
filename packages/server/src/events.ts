import { Packet, Request, Response } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import { getAmbient, newEvent } from '@prisel/state';
import { getPlayerAmbient, roomIdAmbient } from './ambients';
import { Socket } from './objects';
import { Player } from './player';

const [_packetEvent, _emitPacketEvent] = newEvent<{ socket: Socket; packet: Packet }>('packet');

export const emitPacketEvent = _emitPacketEvent;

function toRequest(value: { socket: Socket; packet: Packet }): {
    socket: Socket;
    packet: Request;
} {
    return {
        socket: value.socket,
        packet: value.packet as Request,
    };
}

export const requestEvent = _packetEvent
    .filter(({ packet }) => Request.isRequest(packet))
    .map(toRequest);
export const defaultPacketEvent = _packetEvent.filter(
    ({ packet }) => !Request.isRequest(packet) && !Response.isResponse(packet),
);
newEvent<{ socket: Socket; packet: Request }>('request');

function toPlayer<T>(socketAndPacket: { socket: Socket; packet: T }): {
    player: Player;
    packet: T;
} {
    const { socket, packet } = socketAndPacket;
    return {
        player: getAmbient(getPlayerAmbient)(socket)!!,
        packet,
    };
}

const loggedInRequest = requestEvent.map(toPlayer).filter(({ player }) => !!player);
const loggedInPacket = defaultPacketEvent.map(toPlayer).filter(({ player }) => !!player);

function isCustomAction(action: string) {
    return ({ packet }: { packet: Packet }) => Packet.isCustomAction(packet, action);
}

export const systemActionRequestEvent = loggedInRequest.filter(({ packet }) =>
    Packet.isAnySystemAction(packet),
);

export const customActionRequestEvent = (action: string) =>
    loggedInRequest
        .filter(({ packet }) => Packet.isAnyCustomAction(packet))
        .filter(isInRoom)
        .filter(isCustomAction(action));

export const systemActionPacketEvent = loggedInPacket.filter(({ packet }) =>
    Packet.isAnySystemAction(packet),
);

export const customActionPacketEvent = (action: string) =>
    loggedInPacket
        .filter(({ packet }) => Packet.isAnyCustomAction(packet))
        .filter(isInRoom)
        .filter(isCustomAction(action));

export function isInRoom(data: { player: Player }) {
    return data.player.getRoomId() === getAmbient(roomIdAmbient);
}

export function isSystemAction(systemActionType: priselpb.SystemActionType) {
    return ({ packet }: { packet: Packet }) => {
        return Request.isRequest(packet) && Packet.getSystemAction(packet) === systemActionType;
    };
}

const [playerExitEvent, _emitPlayerExitEvent] = newEvent<Player>('player-exit');
export const emitPlayerExitEvent = _emitPlayerExitEvent;
export const playerExitRoomEvent = playerExitEvent.filter(
    (player) => player.getRoomId() === getAmbient(roomIdAmbient),
);
