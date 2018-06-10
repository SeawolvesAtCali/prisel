const { ACTION } = require('./autoScriptUtils');
const debug = require('debug')('debug');

class AutoScriptPlugin {
    constructor(script = {}) {
        this.messages = [];
        this.messageHead = 0;
        this.actions = script.actions;
        this.actionHead = 0;
    }

    runAction(action, state, emit) {
        switch (action.action) {
            case ACTION.EMIT:
                const { namespace, data } = action;
                if (typeof data[0] === 'function') {
                    emit(namespace, ...data[0](state));
                } else {
                    emit(namespace, ...data);
                }
                return true;
            case ACTION.WAIT:
                const { type, callback } = action;
                return this.messages.slice(this.messageHead).some((message, index) => {
                    if (message[0] === type) {
                        callback();
                        this.messageHead = index + 1;
                        return true;
                    }
                    return false;
                });
            case ACTION.DISCONNECT:
                debug('disconnecting');
                process.exit(0);
                break;
            default:
                throw new Error(`${action} is not supported by autoScript`);
        }
        return false;
    }

    attemptActions(state, emit) {
        while (
            this.actions &&
            this.actionHead < this.actions.length &&
            this.runAction(this.actions[this.actionHead], state, emit)
        ) {
            this.actionHead++;
        }
    }
    onConnect(state, emit) {
        this.attemptActions(state, emit);
    }

    onMessage(state, emit, ...data) {
        this.messages.push(data);
        this.attemptActions(state, emit);
    }
}

module.exports = AutoScriptPlugin;
