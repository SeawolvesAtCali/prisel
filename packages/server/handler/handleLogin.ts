import WebSocket from 'ws';
import { Context, Socket, ClientType } from '../objects';
import { newId } from '../idUtils';
import { emit } from '../networkUtils';
import * as roomMessages from '../message/room';
import RoomType from '@monopoly/common/lib/message/room';
import clientHandlerRegister from '../clientHandlerRegister';
import debug from '../debug';
import { ClientId } from '../objects/client';

const SOCKET = 'CONTROLLER';
export const handleLogin = (context: Context, client: Socket) => (data: { username: string }) => {
    const id = newId<ClientId>(SOCKET);
    const { updateState, SocketManager } = context;
    const { username } = data;
    SocketManager.add(id, client);
    updateState((draftState) => {
        draftState.connections[id] = {
            id,
            username,
            type: ClientType.Controller,
        };
    });
    emit(client, ...roomMessages.getLoginSuccess(id));
};

clientHandlerRegister.push([RoomType.LOGIN, handleLogin]);
