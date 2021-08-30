import { nonNull, Packet, Response } from '@prisel/common';
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
    const payload = Packet.getPayload(request, priselpb.LoginRequest.getRootAsLoginRequest);
    if (Packet.isSystemAction(request, priselpb.SystemActionType.LOGIN) && nonNull(payload)) {
        const username = payload.username() ?? 'unnamed';
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
            Response.forRequest(request)
                .withPayloadBuilder((builder) =>
                    priselpb.LoginResponse.createLoginResponse(builder, builder.createString(id)),
                )
                .build(),
        );
    }
};

clientHandlerRegister.push(priselpb.SystemActionType.LOGIN, handleLogin);
