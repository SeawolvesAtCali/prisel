import { packet, packet_type, status } from '@prisel/protos';
import { AnyUtils } from './anyUtils';
import { PacketBuilder } from './packet';
import { Request } from './request';

export interface Response extends packet.Packet {
    type: packet_type.PacketType.RESPONSE;
    requestId: string;
    status: status.Status;
}

function isResponse(p: packet.Packet): p is Response {
    return (
        p.type === packet_type.PacketType.RESPONSE &&
        typeof p.requestId === 'number' &&
        p.status != undefined
    );
}

class ResponseBuilder<Payload = never> extends PacketBuilder<Payload> {
    id: Response['requestId'];
    status: status.Status;
    static forRequest<Payload = never>(request: Request) {
        const builder = new ResponseBuilder<Payload>();
        builder.message = request.message.$case;
        if (request.message.$case === 'systemAction') {
            builder.systemAction = request.message.systemAction;
        } else {
            builder.action = request.message.action;
        }
        return builder;
    }

    setFailure(message?: string, detail?: string): this {
        this.status = {
            code: status.Status_Code.FAILED,
            message,
            detail,
        };
        return this;
    }

    public build(): Response {
        const result: Response = {
            type: packet_type.PacketType.RESPONSE,
            requestId: this.id,
            status: this.status
                ? this.status
                : {
                      code: status.Status_Code.OK,
                  },
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

export const Response = {
    isResponse,
    forRequest<Payload = any>(request: Request) {
        return ResponseBuilder.forRequest<Payload>(request);
    },
};
