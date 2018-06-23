const ACTION = {
    WAIT: 'WAIT',
    EMIT: 'EMIT',
    DISCONNECT: 'DISCONNECT',
};

function wait(type, namespace) {
    return {
        action: ACTION.WAIT,
        type,
        namespace,
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
