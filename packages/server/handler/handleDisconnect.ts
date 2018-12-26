import { Context, Socket } from '../objects';
import { handleLeaveImpl } from './handleRoomActions';
import { updateClientWithRoomData } from '../updateUtils';

export const handleDisconnect = (context: Context, socket: Socket) => (data: {}) => {
    const { SocketManager, updateState } = context;
    const roomId = handleLeaveImpl(context, socket)(data);
    updateClientWithRoomData(context, roomId);
    const clientId = SocketManager.getId(socket);
    SocketManager.removeBySocket(socket);
    updateState((draft) => {
        delete draft.connections[clientId];
    });
};
