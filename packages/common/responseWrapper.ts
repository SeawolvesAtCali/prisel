import { Response } from './packet';
import { Code } from './code';

export interface ResponseWrapper<Payload = any> extends Response<Payload> {
    get(): Response<Payload>;
    ok(): boolean;
    failed(): boolean;
    getMessage(): string;
    getDetail(): any;
}

class ResponseWrapperImpl<Payload = any> implements ResponseWrapper<Payload> {
    private raw: Response<Payload>;
    constructor(response: Response<Payload>) {
        this.raw = response;
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

    public get request_id() {
        return this.raw.request_id;
    }

    public get() {
        return this.raw;
    }

    public ok() {
        return this.status.code === Code.OK;
    }

    public failed() {
        return this.status.code === Code.FAILED;
    }

    public getMessage() {
        return this.status.message || '';
    }

    public getDetail() {
        return this.status.detail;
    }
}

export function wrapResponse<Payload = any>(response: Response<Payload>): ResponseWrapper<Payload> {
    return new ResponseWrapperImpl(response);
}
