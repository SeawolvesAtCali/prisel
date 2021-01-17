import { packet, packet_type, status, system_action_type } from '@prisel/protos';
import { isValidResponse, PacketBuilder } from './packet';
import { Request } from './request';

export interface Response extends packet.Packet {
    type: packet_type.PacketType.RESPONSE;
    requestId: string;
    status: status.Status;
}

function isResponse(p: packet.Packet | undefined): p is Response {
    return isValidResponse(p);
}

export class ResponseBuilder extends PacketBuilder {
    id: Response['requestId'] = '';
    status: status.Status = { code: status.Status_Code.UNSPECIFIED };
    static forRequest(request: Request) {
        const builder = new ResponseBuilder();
        if (request.message.oneofKind === undefined) {
            // Not likely to happen, unless client maliciously sends a request
            // without message. In this case, we can't really recover. We just
            // send back an ERROR as a response. The error message will be in
            // the payload as well as status.
            builder.message = 'systemAction';
            builder.id = request.requestId;
            builder.systemAction = system_action_type.SystemActionType.ERROR;
            builder.setFailure('Request should either be systemAction or action');
            builder.setPayload('errorPayload', {
                message: 'Request should either be systemAction or action',
            });
            return builder;
        }
        builder.message = request.message.oneofKind;
        if (request.message.oneofKind === 'systemAction') {
            builder.systemAction = request.message.systemAction;
        } else {
            builder.action = request.message.action;
        }
        builder.id = request.requestId;
        builder.setSuccess();
        return builder;
    }

    public setSuccess(): this {
        this.status = {
            code: status.Status_Code.OK,
        };
        return this;
    }

    public setFailure(message?: string, detail?: string): this {
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
                          oneofKind: 'systemAction',
                          systemAction: this.systemAction,
                      }
                    : {
                          oneofKind: 'action',
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
