import { packet, packet_type, status } from '@prisel/protos';
import { isValidResponse, PacketBuilder } from './packet';
import { Request } from './request';

export interface Response extends packet.Packet {
    type: packet_type.PacketType.RESPONSE;
    requestId: string;
    status: status.Status;
}

function isResponse(p: packet.Packet): p is Response {
    return isValidResponse(p);
}

export class ResponseBuilder extends PacketBuilder {
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
        builder.status = {
            code: status.Status_Code.OK,
        };
        return builder;
    }

    setFailure(message?: string, detail?: string): this {
        this.status = {
            code: status.Status_Code.FAILED,
        };
        if (message != undefined) {
            this.status.message = message;
        }
        if (detail != undefined) {
            this.status.detail = detail;
        }
        return this;
    }

    public build(): Response {
        const packet = super.build();
        return {
            ...packet,
            type: packet_type.PacketType.RESPONSE,
            requestId: this.id,
            status: this.status,
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
