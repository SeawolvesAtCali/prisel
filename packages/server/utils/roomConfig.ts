import Handle from './handle';
import { ClientId } from '../objects/client';
import {
    getFailure,
    getJoinSuccess,
    getCreateRoomSuccess,
    getLeaveSuccess,
    getGameStartSuccess,
} from '../message';
import { MessageType } from '@prisel/common';
import { GAME_PHASE } from '../objects/gamePhase';

type EventHandler = (handle: Handle, client: ClientId, data: any) => void;

export interface RoomConfig {
    type: string;
    onCreate: EventHandler;
    onJoin: EventHandler;
    onLeave: EventHandler;
    onGameStart: EventHandler;
    onMessage: EventHandler;
}

const addClientToRoom = (handle: Handle, client: ClientId) => {
    if (handle.gamePhase === GAME_PHASE.WAITING) {
        handle.addClient(client);
        handle.game.addPlayer(handle, client);
        if (!handle.host) {
            handle.setHost(client);
        }
    }
};

export const BaseRoomConfig: RoomConfig = {
    type: 'room',
    onCreate(handle, client, data) {
        handle.emit(client, ...getCreateRoomSuccess(handle.roomId));
        addClientToRoom(handle, client);
        handle.emit(client, ...getJoinSuccess());
        handle.broadcastRoomUpdate();
    },
    onJoin(handle, client, data) {
        addClientToRoom(handle, client);
        handle.emit(client, ...getJoinSuccess());
        handle.broadcastRoomUpdate();
    },
    onLeave(handle, client, data) {
        handle.removeClient(client);
        handle.game.removePlayer(handle, client);
        handle.emit(client, ...getLeaveSuccess());
        const remainingClients = handle.clients;
        if (remainingClients.length === 0) {
            handle.removeRoom();
            return;
        }
        if (!handle.host) {
            handle.setHost(remainingClients[0]);
        }
        handle.broadcastRoomUpdate();
    },
    onGameStart(handle, client, data) {
        if (client !== handle.host) {
            handle.emit(
                client,
                ...getFailure(MessageType.GAME_START, 'not enough privilege to start game'),
            );
        }
        if (handle.game.start(handle)) {
            handle.startGame();
            handle.broadcast(handle.clients, ...getGameStartSuccess());
        }
    },
    onMessage(handle, client, data) {
        // TODO: assume this only process messages from current room.
        // Cross room messaging is unusual, we will have another mechanism for that.
        handle.game.handleMessage(handle, client, data);
    },
};
