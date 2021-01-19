import { priselpb } from '@prisel/protos';
import { isValidRequest, PacketBuilder } from './packet';

export interface Request extends priselpb.Packet {
    type: priselpb.PacketType.REQUEST;
    requestId: string;
}

function isRequest(p: priselpb.Packet | undefined): p is Request {
    return isValidRequest(p);
}

export class RequestBuilder extends PacketBuilder {
    id: Request['requestId'] = '';

    public static forSystemAction(action: priselpb.SystemActionType) {
        const builder = new RequestBuilder();
        builder.message = 'systemAction';
        builder.systemAction = action;
        return builder;
    }

    public static forAction(action: string) {
        const builder = new RequestBuilder();
        builder.message = 'action';
        builder.action = action;
        return builder;
    }

    public setId(id: Request['requestId']): RequestBuilder {
        this.id = id;
        return this;
    }

    public build(): Request {
        const packet = super.build();
        return { ...packet, type: priselpb.PacketType.REQUEST, requestId: this.id };
    }
}

export const Request = {
    isRequest,
    forSystemAction(action: priselpb.SystemActionType) {
        return RequestBuilder.forSystemAction(action);
    },
    forAction(action: string) {
        return RequestBuilder.forAction(action);
    },
};
