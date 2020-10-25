import { status } from '@prisel/protos';
import { unpack } from './anyUtils';
import { Response } from './response';

export interface ResponseWrapper<Payload = any> extends Response {
    get(): Response;
    unpackPayload(): Payload;
    ok(): boolean;
    failed(): boolean;
    getMessage(): string;
    getDetail(): any;
}

class ResponseWrapperImpl<Payload = any> implements ResponseWrapper<Payload> {
    private raw: Response;
    private payloadClass: { decode: (message: Uint8Array) => Payload };
    constructor(response: Response, payloadClass?: { decode: (message: Uint8Array) => Payload }) {
        this.raw = response;
        this.payloadClass = payloadClass;
    }
    unpackPayload(): Payload | undefined {
        if (this.payloadClass && this.raw.payload) {
            return unpack(this.raw.payload.value, this.payloadClass);
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
    payloadClass?: { decode: (input: Uint8Array) => Payload },
): ResponseWrapper<Payload> {
    return new ResponseWrapperImpl(response, payloadClass);
}
