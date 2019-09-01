import { MessageType } from '@prisel/common';
import { Handle } from './handle';
import { ClientId } from '../objects/client';
import { getFailure, getJoinSuccess, getLeaveSuccess, getGameStartSuccess } from '../message';
import { GAME_PHASE } from '../objects/gamePhase';
import debug from '../debug';
import { GameConfig } from './gameConfig';

type EventHandler = (handle: Handle, client: ClientId, data: any) => void;

interface FullRoomConfig {
    type: string;
    supportGame: (game: GameConfig) => boolean;
    onCreate: EventHandler;
    onJoin: EventHandler;
    onLeave: EventHandler;
    onGameStart: EventHandler;
    onMessage: EventHandler;
}

export type RoomConfig = Partial<FullRoomConfig>;

export const BaseRoomConfig: RoomConfig = {
    type: 'room',
    supportGame(game) {
        return true;
    },
    onCreate(handle, client, data) {
        handle.addPlayer(client);
        handle.setHost(client);
        handle.emit(client, ...getJoinSuccess());
        handle.broadcastRoomUpdate();
    },
    onJoin(handle, client, data) {
        if (handle.gamePhase === GAME_PHASE.WAITING) {
            handle.addPlayer(client);
            handle.emit(client, ...getJoinSuccess());
            handle.broadcastRoomUpdate();
        } else {
            handle.emit(
                client,
                ...getFailure(MessageType.JOIN, 'Cannot join when game is already started'),
            );
        }
    },
    onLeave(handle, client, data) {
        handle.removePlayer(client);
        handle.emit(client, ...getLeaveSuccess());
        const remainingClients = handle.players;
        if (remainingClients.length > 0 && !handle.host) {
            handle.setHost(remainingClients[0]);
        }
        handle.broadcastRoomUpdate();
    },
    onGameStart(handle, client, data) {
        if (client !== handle.host) {
            handle.emit(
                client,
                ...getFailure(MessageType.GAME_START, 'Not enough privilege to start game'),
            );
            return;
        }
        if (handle.canStart()) {
            debug('Starting game!', handle.game.type, handle.room.type);
            handle.broadcast(handle.players, ...getGameStartSuccess());
            handle.startGame();
        }
    },
    onMessage(handle, client, data) {},
};
