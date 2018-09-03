import { Context, Socket, Client, ClientType } from './objects';
import { newId } from './idUtils';
import { emit } from './networkUtils';
import * as roomMessages from './message/room';
import { handleRoomActions } from './roomController';
import debug from './debug';

const CONTROLLER = 'CONTROLLER';
export const handleLogin = (context: Context, client: Socket) => (data: { username: string }) => {
    const id = newId(CONTROLLER);
    const { username } = data;
    const { StateManager, SocketManager } = context;
    const { connections } = StateManager;
    SocketManager.add(id, client);

    const controller: Client = {
        id,
        username,
        type: ClientType.Controller,
    };

    connections.controllers = {
        ...connections.controllers,
        id: controller,
    };

    emit(client, ...roomMessages.getLoginSuccess(controller.id));
};

export const handleControllerConnection = (context: Context) => (client: Socket) => {
    client.on('PING', () => {
        emit(client, ...roomMessages.getPong());
    });
    client.on('LOGIN', handleLogin(context, client));
    handleRoomActions(context, client);
};
