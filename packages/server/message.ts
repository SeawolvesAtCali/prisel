import {
    MessageType,
    Packet,
    PacketType,
    Request,
    Status,
    Response,
    LoginPayload,
    Code,
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
export function getSuccessFor<Payload = never>(
    request: Request<any>,
    payload?: Payload,
): Response<Payload> {
    return getResponseFor(request, { code: Code.OK }, payload);
}

export function getFailureFor(
    request: Request<any>,
    message?: string,
    detail?: any,
): Response<never> {
    const status: Status = {
        code: Code.FAILED,
    };
    if (message) {
        status.message = message;
    }
    if (detail !== undefined) {
        status.detail = detail;
    }
    return getResponseFor(request, status);
}

/**
 * Success response for client login
 * @param {String} userId
 */
export function getLoginSuccess(loginRequest: Request<LoginPayload>, userId: string) {
    return getSuccessFor(loginRequest, { userId });
}
