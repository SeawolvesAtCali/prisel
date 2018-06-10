const ACTION = {
    WAIT: 'WAIT',
    EMIT: 'EMIT',
    DISCONNECT: 'DISCONNECT',
};

const noop = () => {};

function wait(type, func = noop) {
    return {
        action: ACTION.WAIT,
        type,
        callback: func,
    };
}

function emit(namespace, ...data) {
    return {
        action: ACTION.EMIT,
        namespace,
        data,
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
    disconnect,
};
