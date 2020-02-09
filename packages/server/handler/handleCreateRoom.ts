import { Context, Socket } from '../objects';
import { MessageType, Request, CreateRoomPayload } from '@prisel/common';
import clientHandlerRegister from '../clientHandlerRegister';

import { getPlayer } from '../utils/stateUtils';

export const handleCreateRoom = (context: Context, socket: Socket) => (
    request: Request<CreateRoomPayload>,
) => {
    const player = getPlayer(context, socket);
    if (!player) {
        // player hasn't login yet
        // TODO(minor) give some error message to client
        return;
    }
    const roomConfig = context.roomConfig;
    const failureResponse = roomConfig.preCreate(player, request);
    if (failureResponse) {
        player.emit(failureResponse);
        return;
    }

    roomConfig.onCreate(player, request);

    // TODO setup initial game state

    // const initialState = handle.game.onSetup(handle);
    // if (initialState) {
    //     handle.setState(initialState);
    // }
};

clientHandlerRegister.push(MessageType.CREATE_ROOM, handleCreateRoom);
