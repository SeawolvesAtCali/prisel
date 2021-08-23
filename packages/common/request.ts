import { priselpb } from '@prisel/protos';
import { isValidRequest, PacketBuilder } from './packet';

export interface Request extends priselpb.Packet {
    type(): priselpb.PacketType.REQUEST;
    requestId(): string;
}

function verify(p: priselpb.Packet | undefined): p is Request {
    return isValidRequest(p);
}

export class RequestBuilder extends PacketBuilder {
    public static forSystemAction(action: priselpb.SystemActionType) {
        const builder = new RequestBuilder();
        builder.systemAction = action;
        return builder;
    }

    public static forAction(action: string) {
        const builder = new RequestBuilder();
        builder.action = action;
        return builder;
    }

    public setId(id: ReturnType<Request['requestId']>): RequestBuilder {
        this.id = id;
        return this;
    }

    public build(): [Uint8Array, Request] {
        this.packetType = priselpb.PacketType.REQUEST;
        const [array, request] = super.build();
        return [array, request as Request];
    }
}

export const Request = {
    verify,
    forSystemAction(action: priselpb.SystemActionType) {
        return RequestBuilder.forSystemAction(action);
    },
    forAction(action: string) {
        return RequestBuilder.forAction(action);
    },
};
