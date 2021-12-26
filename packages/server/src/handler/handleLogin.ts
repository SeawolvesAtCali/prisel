import { Packet, Response } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import clientHandlerRegister, { Handler } from '../clientHandlerRegister';
import { newPlayer, PlayerId } from '../player';
import { newId } from '../utils/idUtils';
import { emit } from '../utils/networkUtils';
import { verifyIsRequest } from './utils';

const SOCKET = 'CLIENT';
export const handleLogin: Handler = (context, client) => (request) => {
    if (!verifyIsRequest(request)) {
        return;
    }
    const id = newId<PlayerId>(SOCKET);
    const { SocketManager } = context;
    const payload = Packet.getPayload(request, 'loginRequest');
    if (Packet.isSystemAction(request, priselpb.SystemActionType.LOGIN) && payload) {
        const { username } = payload;
        SocketManager.add(id, client);
        context.players.set(
            id,
            newPlayer(context, {
                name: username,
                id,
            }),
        );
        emit(
            client,
            Response.forRequest(request).setPayload('loginResponse', { userId: id }).build(),
        );
    }
};

clientHandlerRegister.push(priselpb.SystemActionType.LOGIN, handleLogin);
