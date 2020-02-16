import {
    MessageType,
    Packet,
    PacketType,
    Request,
    Status,
    Response,
    LoginPayload,
} from '@prisel/common';

interface BroadcastMessagePayload {
    username: string;
    message: string;
}
export function getBroadcastMessage(
    username: string,
    message: string,
): Packet<BroadcastMessagePayload> {
    return {
        type: PacketType.DEFAULT,
        system_action: MessageType.BROADCAST,
        payload: {
            username,
            message,
        },
    };
}

export function getWelcome(): Packet<never> {
    return {
        type: PacketType.DEFAULT,
        system_action: MessageType.WELCOME,
    };
}

export function getResponseFor<T = never>(
    request: Request<any>,
    status: Status,
    payload?: T,
): Response<T> {
    const response: Response<T> = {
        type: PacketType.RESPONSE,
        request_id: request.request_id,
        status,
    };
    if (payload !== undefined) {
        response.payload = payload;
    }
    if (request.action !== undefined) {
        response.action = request.action;
        return response;
    }
    response.system_action = request.system_action;
    return response;
}
export function getSuccessFor<T = never>(request: Request<any>, payload?: T): Response<T> {
    return getResponseFor(request, Status.SUCCESS, payload);
}

export function getFailureFor<T = never>(request: Request<any>, payload?: T): Response<T> {
    return getResponseFor(request, Status.FAILURE, payload);
}

/**
 * Success response for client login
 * @param {String} userId
 */
export function getLoginSuccess(loginRequest: Request<LoginPayload>, userId: string) {
    return getSuccessFor(loginRequest, { userId });
}
