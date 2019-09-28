import { Context } from '../objects';
import { emit } from './networkUtils';
import { ClientId } from '../objects/client';
import { RoomId } from '../objects/room';
import { MessageType, isPayload, Payload, isMessageType } from '@prisel/common';
import { GameConfig } from './gameConfig';
import { RoomConfig } from './roomConfig';
import { updateClientWithRoomData } from './updateUtils';

import { Handle, HandleProps } from './abstractHandle';

/**
 * handle provides utilities to update room and game state
 * as well as performing network calls.
 */
// tslint:disable-next-line:max-classes-per-file
class HandleImpl extends Handle {
    public roomId: RoomId;
    public game: GameConfig;
    public room: RoomConfig;

    protected context: Context;

    constructor({ context, roomId, gameConfig, roomConfig }: HandleProps) {
        super({ context, roomId, gameConfig, roomConfig });
    }

    public emit(playerId: ClientId, ...rest: [MessageType, Payload] | [Payload]) {
        if (isMessageType(rest[0]) && isPayload(rest[1])) {
            emitWithPlayerId(this.context, playerId, rest[0], rest[1]);
        }
        if (isPayload(rest[0])) {
            emitWithPlayerId(this.context, playerId, MessageType.MESSAGE, rest[0]);
        }
    }

    public broadcast(playerIds: ClientId[], ...rest: [MessageType, Payload] | [Payload]) {
        playerIds.forEach((playerId) => {
            this.emit(playerId, ...rest);
        });
    }

    public broadcastRoomUpdate() {
        updateClientWithRoomData(this.context, this.roomId);
    }
}

function emitWithPlayerId(
    context: Context,
    playerId: ClientId,
    messageType: MessageType,
    payload: Payload,
): void {
    const { SocketManager } = context;
    const clientSocket = SocketManager.getSocket(playerId);
    if (clientSocket) {
        emit(clientSocket, messageType, payload);
    }
}

function createHandle(props: HandleProps): Handle {
    return new HandleImpl(props);
}

export { Handle, HandleProps };
export default createHandle;
