import { Packet, Response } from '@prisel/common';
import { system_action_type } from '@prisel/protos';
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
    if (
        Packet.isSystemAction(request, system_action_type.SystemActionType.LOGIN) &&
        Packet.hasPayload(request, 'loginRequest')
    ) {
        const { username } = Packet.getPayload(request, 'loginRequest');
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

clientHandlerRegister.push(system_action_type.SystemActionType.LOGIN, handleLogin);
