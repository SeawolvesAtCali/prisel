import { Context, Socket, ClientType } from '../objects';
import { newId } from '../idUtils';
import { emit } from '../networkUtils';
import * as roomMessages from '../message/room';
import RoomType from '../../common/message/room';
import clientHandlerRegister from '../clientHandlerRegister';
import debug from '../debug';

const SOCKET = 'CONTROLLER';
export const handleLogin = (context: Context, client: Socket) => (data: { username: string }) => {
    const id = newId(SOCKET);
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

clientHandlerRegister.push([RoomType.LOGIN, handleLogin]);
