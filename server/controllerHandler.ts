import { Context, Socket, Client, ClientType } from './objects';
import { newId } from './idUtils';
import { emit } from './networkUtils';
import * as roomMessages from './message/room';
import RoomType from '../common/message/room';
import { handleRoomActions } from './roomController';
import debug from './debug';

const CONTROLLER = 'CONTROLLER';
export const handleLogin = (context: Context, client: Socket) => (data: { username: string }) => {
    const id = newId(CONTROLLER);
    const { updateState, SocketManager } = context;
    const { username } = data;
    SocketManager.add(id, client);
    updateState((draftState) => {
        draftState.connections.controllers[id] = {
            id,
            username,
            type: ClientType.Controller,
        };
    });
    emit(client, ...roomMessages.getLoginSuccess(id));
};

export const handleControllerConnection = (context: Context) => (client: Socket) => {
    client.on(RoomType.PING, () => {
        emit(client, ...roomMessages.getPong());
    });
    client.on(RoomType.LOGIN, handleLogin(context, client));
    handleRoomActions(context, client);
};
