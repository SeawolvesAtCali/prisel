import { packet, packet_type, system_action_type } from '@prisel/protos';
import { PacketBuilder } from './packet';

export interface Request extends packet.Packet {
    type: packet_type.PacketType.REQUEST;
    requestId: string;
}

function isRequest(p: packet.Packet): p is Request {
    return p.type === packet_type.PacketType.REQUEST && p.requestId !== undefined;
}

class RequestBuilder extends PacketBuilder {
    id: Request['requestId'];

    public static forSystemAction(action: system_action_type.SystemActionType) {
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
        return { ...packet, type: packet_type.PacketType.REQUEST, requestId: this.id };
    }
}

export const Request = {
    isRequest,
    forSystemAction(action: system_action_type.SystemActionType) {
        return RequestBuilder.forSystemAction(action);
    },
    forAction(action: string) {
        return RequestBuilder.forAction(action);
    },
};
