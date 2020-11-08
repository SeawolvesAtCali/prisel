import { packet, packet_type, system_action_type } from '@prisel/protos';
import { AnyUtils } from './anyUtils';
import { PacketBuilder } from './packet';

export interface Request extends packet.Packet {
    type: packet_type.PacketType.REQUEST;
    requestId: string;
}

function isRequest(p: packet.Packet): p is Request {
    return p.type === packet_type.PacketType.REQUEST && p.requestId !== undefined;
}

class RequestBuilder<Payload = never> extends PacketBuilder<Payload> {
    id: Request['requestId'];

    public static forSystemAction<Payload = never>(action: system_action_type.SystemActionType) {
        const builder = new RequestBuilder<Payload>();
        builder.message = 'systemAction';
        builder.systemAction = action;
        return builder;
    }

    public static forAction<Payload = never>(action: string) {
        const builder = new RequestBuilder<Payload>();
        builder.message = 'action';
        builder.action = action;
        return builder;
    }

    public setId(id: Request['requestId']): RequestBuilder<Payload> {
        this.id = id;
        return this;
    }

    public build(): Request {
        const result: Request = {
            type: packet_type.PacketType.REQUEST,
            requestId: this.id,
            message:
                this.message === 'systemAction'
                    ? {
                          $case: 'systemAction',
                          systemAction: this.systemAction,
                      }
                    : {
                          $case: 'action',
                          action: this.action,
                      },
        };
        if (this.payloadClass && this.payload) {
            result.payload = AnyUtils.pack(this.payload, this.payloadClass);
        }
        return result;
    }
}

export const Request = {
    isRequest,
    forSystemAction<Payload = never>(action: system_action_type.SystemActionType) {
        return RequestBuilder.forSystemAction<Payload>(action);
    },
    forAction<Payload = never>(action: string) {
        return RequestBuilder.forAction<Payload>(action);
    },
};
