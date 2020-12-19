import { status } from '@prisel/protos';
import { Response } from './response';

export interface ResponseWrapper extends Response {
    get(): Response;
    ok(): boolean;
    failed(): boolean;
    getMessage(): string;
    getDetail(): any;
}

class ResponseWrapperImpl implements ResponseWrapper {
    private raw;

    constructor(response: Response) {
        this.raw = response;
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

export function wrapResponse(
    response: Response,
    payloadClass?: { typeUrl: string },
): ResponseWrapper {
    return new ResponseWrapperImpl(response);
}
