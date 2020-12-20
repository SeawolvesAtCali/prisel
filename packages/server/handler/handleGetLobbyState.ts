import { Response } from '@prisel/common';
import { system_action_type } from '@prisel/protos';
import clientHandlerRegister, { Handler } from '../clientHandlerRegister';
import { getRoomInfo, getRooms } from '../utils/stateUtils';
import { getPlayerOrRespondError, verifyIsRequest } from './utils';

export const handleGetLobbyState: Handler = (context, socket) => (request) => {
    if (!verifyIsRequest(request)) {
        return;
    }
    const player = getPlayerOrRespondError(context, socket, request);
    if (!player) {
        return;
    }
    const rooms = getRooms(context);

    player.respond(
        Response.forRequest(request)
            .setPayload('getLobbyStateResponse', {
                rooms: rooms.map((room) => ({
                    room: getRoomInfo(room),
                    playerCount: room.getPlayers().length,
                    maxPlayers: context.gameConfig.maxPlayers,
                })),
            })
            .build(),
    );
};

clientHandlerRegister.push(
    system_action_type.SystemActionType.GET_LOBBY_STATE,
    handleGetLobbyState,
);
