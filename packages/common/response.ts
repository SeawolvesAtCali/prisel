import { packet, packet_type, status } from '@prisel/protos';
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
        p.requestId !== undefined &&
        p.status !== undefined
    );
}

class ResponseBuilder extends PacketBuilder {
    id: Response['requestId'];
    status: status.Status;
    static forRequest(request: Request) {
        const builder = new ResponseBuilder();
        builder.message = request.message.$case;
        if (request.message.$case === 'systemAction') {
            builder.systemAction = request.message.systemAction;
        } else {
            builder.action = request.message.action;
        }
        builder.id = request.requestId;
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
        const packet = super.build();
        return {
            ...packet,
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
    }
}

export const Response = {
    isResponse,
    forRequest(request: Request) {
        return ResponseBuilder.forRequest(request);
    },
};
