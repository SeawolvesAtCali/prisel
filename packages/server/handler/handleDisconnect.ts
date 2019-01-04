import { Context, Socket } from '../objects';
import { handleLeaveImpl } from './handleRoomActions';
import { updateClientWithRoomData } from '../utils/updateUtils';
import { getRoom } from '../utils/stateUtils';

/**
 * Handles client disconnection when client disconnects unexpectedly
 * @param context
 * @param socket
 */
export const handleDisconnect = (context: Context, socket: Socket) => (data: {}) => {
    const { SocketManager, updateState } = context;
    if (!SocketManager.hasSocket(socket)) {
        // client is not login yet, nothing to do
        return;
    }
    const room = getRoom(context, socket);
    if (room) {
        handleLeaveImpl(context, socket)(data);
        updateClientWithRoomData(context, room.id);
    }
    const clientId = SocketManager.getId(socket);
    SocketManager.removeBySocket(socket);
    updateState((draft) => {
        delete draft.connections[clientId];
    });
};
