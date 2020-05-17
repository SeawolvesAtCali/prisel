import { Context, Socket } from '../objects';
import clientHandlerRegister from '../clientHandlerRegister';
import { getPlayerOrRespondError } from './utils';
import { Request, MessageType, LobbyStateResponsePayload } from '@prisel/common';
import { getRooms, getRoomInfo } from '../utils/stateUtils';

export const handleGetLobbyState = (context: Context, socket: Socket) => (request: Request) => {
    const player = getPlayerOrRespondError(context, socket, request);
    if (!player) {
        return;
    }
    const rooms = getRooms(context);

    player.respond<LobbyStateResponsePayload>(request, {
        rooms: rooms.map((room) => ({
            room: getRoomInfo(room),
            playerCount: room.getPlayers().length,
            maxPlayers: context.gameConfig.maxPlayers,
        })),
    });
};

clientHandlerRegister.push(MessageType.GET_LOBBY_STATE, handleGetLobbyState);
