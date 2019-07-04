import MessageTypes from './messageTypes';
export interface FeedbackType {
    action: MessageTypes;
    [property: string]: unknown;
}

interface AnyPayloadType {
    [property: string]: unknown;
}

export type PayloadType = FeedbackType | AnyPayloadType;

export function isFeedback(payload: PayloadType): payload is FeedbackType {
    return (payload as FeedbackType).action !== undefined;
}
