import { RoomId } from '@prisel/common';
import { newAmbient } from '@prisel/state';
import { Socket } from './objects';
import { Player } from './player';
import { RoomType } from './serverConfig';

export const [getPlayerAmbient, provideGetPlayerAmbient] =
    newAmbient<(socket: Socket) => Player | undefined>('get-player');

/**
 * Player in a room
 */
export const [playersAmbient, providePlayersAmbient] = newAmbient<{ current: Player[] }>('players');
export const [roomNameAmbient, provideRoomNameAmbient] = newAmbient<string>('room-name');
export const [roomIdAmbient, provideRoomIdAmbient] = newAmbient<RoomId>('room-id');
export const [roomTypeAmbient, provideRoomTypeAmbient] = newAmbient<RoomType>('room-type');
