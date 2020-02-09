import { Context, Socket } from '../objects';
import { newId } from '../utils/idUtils';
import { emit } from '../utils/networkUtils';
import { MessageType, Request, LoginPayload, Response, LoginResponsePayload } from '@prisel/common';
import clientHandlerRegister from '../clientHandlerRegister';
import { getSuccessFor } from '../message';
import { newPlayer, PlayerId } from '../player';

const SOCKET = 'CLIENT';
export const handleLogin = (context: Context, client: Socket) => (
    request: Request<LoginPayload>,
) => {
    const id = newId<PlayerId>(SOCKET);
    const { SocketManager } = context;
    const { username } = request.payload;
    SocketManager.add(id, client);
    // updateState((draftState) => {
    //     draftState.connections[id] = {
    //         id,
    //         username,
    //     };
    // });
    context.players.set(
        id,
        newPlayer(context, {
            name: username,
            id,
        }),
    );
    const response = getSuccessFor<LoginResponsePayload>(request, {
        userId: id,
    });
    emit<Response<LoginResponsePayload>>(client, response);
};

clientHandlerRegister.push(MessageType.LOGIN, handleLogin);
