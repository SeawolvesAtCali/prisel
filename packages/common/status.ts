import { Code, isCode } from './code';

export interface Status {
    /**
     * The status code
     */
    code: Code;
    /**
     * A developer-facing error message, which should be in English. Any
     * user-facing error message should be localized and sent in the [detail]
     * field, or localized by the client.
     */
    message?: string;
    detail?: any;
}

export function isStatus(status: any): status is Status {
    if (!status) {
        return false;
    }
    return isCode(status.code);
}
