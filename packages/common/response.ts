import { priselpb } from '@prisel/protos';
import * as flatbuffers from 'flatbuffers';
import { isNull } from './assert';
import { isValidResponse, Packet, PacketBuilder } from './packet';
import { Request } from './request';
import { StatusBuilder } from './status';

export interface Response extends priselpb.Packet {
    type(): priselpb.PacketType.RESPONSE;
    requestId(): string;
    status(): priselpb.Status;
}

function verify(p: priselpb.Packet | undefined): p is Response {
    return isValidResponse(p);
}

export class ResponseBuilder extends PacketBuilder {
    static forRequest(request: Request) {
        const builder = new ResponseBuilder();
        builder.id = request.requestId();

        if (Packet.isAnySystemAction(request)) {
            builder.systemAction = request.systemActionType();
            return builder;
        }

        if (Packet.isAnyCustomAction(request)) {
            builder.systemAction = priselpb.SystemActionType.UNSPECIFIED;
            builder.action = request.actionType() ?? '';
            return builder;
        }

        // Not likely to happen, unless client maliciously sends a request
        // without message. In this case, we can't really recover. We just
        // send back an ERROR as a response. The error message will be in
        // the payload as well as status.
        builder.systemAction = priselpb.SystemActionType.ERROR;
        builder.status = StatusBuilder.FAILED('Request should either be systemAction or action');
        const errorBuilder = new flatbuffers.Builder(1024);
        const errorMessageString = errorBuilder.createString(
            'Request should either be systemAction or action',
        );
        priselpb.ErrorPayload.startErrorPayload(errorBuilder);
        priselpb.ErrorPayload.addMessage(errorBuilder, errorMessageString);
        errorBuilder.finish(priselpb.ErrorPayload.endErrorPayload(errorBuilder));
        builder.payload = errorBuilder.asUint8Array();

        return builder;
    }

    public withStatus(statusBuilder: StatusBuilder) {
        this.status = statusBuilder;
        return this;
    }

    public setSuccess(): this {
        this.status = StatusBuilder.OK();
        return this;
    }

    public withFailure(message?: string, detail?: string): this {
        this.status = StatusBuilder.FAILED(message, detail);
        return this;
    }

    public build(): [Uint8Array, Response] {
        this.packetType = priselpb.PacketType.RESPONSE;
        if (isNull(this.status)) {
            // if status is not set, default to ok
            this.status = StatusBuilder.OK();
        }
        const [array, response] = super.build();
        return [array, response as Response];
    }
}

export const Response = {
    verify,
    forRequest(request: Request) {
        return ResponseBuilder.forRequest(request);
    },
};
