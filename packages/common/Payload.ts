import MessageTypes from './messageTypes';
export interface Feedback {
    action: MessageTypes;
    [property: string]: unknown;
}

interface AnyPayload {
    [property: string]: unknown;
}

export type Payload = Feedback | AnyPayload;

export function isFeedback(payload: Payload): payload is Feedback {
    return (payload as Feedback).action !== undefined;
}

export function isPayload(arg: any): arg is Payload {
    if (typeof arg !== 'object') {
        return false;
    }
    if ('action' in Object.keys(arg)) {
        return isFeedback(arg as Payload);
    }
    return true;
}
