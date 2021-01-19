import { Packet, Request, Response } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import { debug } from '../debug';
import { getError } from '../message';
import { Context, Socket } from '../objects';
import { Player } from '../player';
import { emit } from '../utils/networkUtils';
import { safeStringify } from '../utils/safeStringify';
import { getPlayer } from '../utils/stateUtils';

export function getPlayerOrRespondError(
    context: Context,
    socket: Socket,
    packet: Packet,
): Player | undefined {
    const player = getPlayer(context, socket);
    if (!player) {
        if (Request.isRequest(packet)) {
            emit(socket, Response.forRequest(packet).setFailure('Please login first').build());
        } else {
            emit(socket, getError('Unauthenticated'));
        }
        return;
    }
    return player;
}

export function verifyIsRequest(p: Packet): p is Request {
    if (!Request.isRequest(p)) {
        const maybeSystemAction =
            Packet.getSystemAction(p) ?? priselpb.SystemActionType.UNSPECIFIED;
        debug(
            `Received ${
                Packet.isAnySystemAction(p)
                    ? priselpb.SystemActionType[maybeSystemAction]
                    : Packet.getAction(p)
            } but packet is not a request: ${safeStringify(p)}`,
        );
        return false;
    }
    return true;
}
