// @flow
import type { MessageT } from '../server/objects/message';

const ACTION = {
    WAIT: 'WAIT',
    EMIT: 'EMIT',
    EXECUTE: 'EXECUTE',
    DISCONNECT: 'DISCONNECT',
};

type CallbackT = (clientState: Object, messageData: Object) => void;

function wait(type: string, namespace: string, callback?: CallbackT) {
    return {
        action: ACTION.WAIT,
        type,
        namespace,
        callback,
    };
}

function emit(namespace: string, ...data: MessageT | Array<(Object) => MessageT>) {
    return {
        action: ACTION.EMIT,
        namespace,
        data,
    };
}

function execute(callback: CallbackT) {
    return {
        action: ACTION.EXECUTE,
        callback,
    };
}

function disconnect() {
    return {
        action: ACTION.DISCONNECT,
    };
}

module.exports = {
    ACTION,
    wait,
    emit,
    execute,
    disconnect,
};
