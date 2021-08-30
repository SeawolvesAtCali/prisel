import { Response } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import clientHandlerRegister, { Handler } from '../clientHandlerRegister';
import { getRooms } from '../utils/stateUtils';
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
            .withPayloadBuilder((builder) =>
                priselpb.GetLobbyStateResponse.createGetLobbyStateResponse(
                    builder,
                    priselpb.GetLobbyStateResponse.createRoomsVector(
                        builder,
                        rooms.map((room) =>
                            priselpb.LobbyRoomViewInfo.createLobbyRoomViewInfo(
                                builder,
                                /* room= */ room.buildRoomInfo(builder),
                                /* playerCount= */ room.getPlayers().length,
                                /* maxPlayers= */ context.gameConfig.maxPlayers,
                            ),
                        ),
                    ),
                ),
            )
            .build(),
    );
};

clientHandlerRegister.push(priselpb.SystemActionType.GET_LOBBY_STATE, handleGetLobbyState);
