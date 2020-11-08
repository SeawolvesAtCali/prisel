import { status } from '@prisel/protos';
import { AnyUtils } from './anyUtils';
import { Response } from './response';

export interface ResponseWrapper<Payload = any> extends Response {
    get(): Response;
    unpackedPayload: Payload;
    ok(): boolean;
    failed(): boolean;
    getMessage(): string;
    getDetail(): any;
}

class ResponseWrapperImpl<Payload = any> implements ResponseWrapper<Payload> {
    private raw;
    private payloadClass;
    private _unpackedPayload: Payload;
    constructor(
        response: Response,
        payloadClass?: { typeUrl: string; decode: (message: Uint8Array) => Payload },
    ) {
        this.raw = response;
        this.payloadClass = payloadClass;
        if (payloadClass && response.payload) {
            this._unpackedPayload = AnyUtils.unpack(this.raw.payload, this.payloadClass);
        }
    }

    public get message() {
        return this.raw.message;
    }
    public get status() {
        return this.raw.status;
    }

    public get type() {
        return this.raw.type;
    }

    public get payload() {
        return this.raw.payload;
    }

    public get unpackedPayload() {
        return this._unpackedPayload;
    }

    public get requestId() {
        return this.raw.requestId;
    }

    public get() {
        return this.raw;
    }

    public ok() {
        return this.status.code === status.Status_Code.OK;
    }

    public failed() {
        return this.status.code === status.Status_Code.FAILED;
    }

    public getMessage() {
        return this.status.message || '';
    }

    public getDetail() {
        return this.status.detail;
    }
}

export function wrapResponse<Payload = any>(
    response: Response,
    payloadClass?: { typeUrl: string; decode: (input: Uint8Array) => Payload },
): ResponseWrapper<Payload> {
    return new ResponseWrapperImpl(response, payloadClass);
}
