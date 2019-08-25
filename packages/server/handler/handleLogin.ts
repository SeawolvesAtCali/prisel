import { Context, Socket } from '../objects';
import { newId } from '../utils/idUtils';
import { emit } from '../utils/networkUtils';
import * as roomMessages from '../message/room';
import { MessageType } from '@prisel/common';
import clientHandlerRegister from '../clientHandlerRegister';
import debug from '../debug';
import { ClientId } from '../objects/client';

const SOCKET = 'CLIENT';
export const handleLogin = (context: Context, client: Socket) => (data: { username: string }) => {
    const id = newId<ClientId>(SOCKET);
    const { updateState, SocketManager } = context;
    const { username } = data;
    SocketManager.add(id, client);
    updateState((draftState) => {
        draftState.connections[id] = {
            id,
            username,
        };
    });
    emit(client, ...roomMessages.getLoginSuccess(id));
};

clientHandlerRegister.push(MessageType.LOGIN, handleLogin);
