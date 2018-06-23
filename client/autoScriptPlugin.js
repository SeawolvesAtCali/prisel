const { ACTION } = require('./autoScriptUtils');
const debug = require('debug')('debug');
const Plugin = require('./plugin');
const uniqBy = require('lodash/uniqBy');

class AutoScriptPlugin extends Plugin {
    constructor(script = {}) {
        super();
        this.messages = [];
        this.messageHead = 0;
        this.actions = script.actions;
        this.actionHead = 0;
    }

    runEmit(action, state, emit) {
        const { namespace, data } = action;
        if (typeof data[0] === 'function') {
            emit(namespace, ...data[0](state));
        } else {
            emit(namespace, ...data);
        }
        return true;
    }

    runWait(action, state, emit) {
        const { type, namespace } = action;
        return this.messages.slice(this.messageHead).some((message, index) => {
            if (message.type === type && message.namespace === namespace) {
                this.messageHead = index + 1;
                return true;
            }
            return false;
        });
    }

    runDisconnect() {
        debug('disconnecting');
        process.exit(0);
    }

    runAction(action, state, emit) {
        switch (action.action) {
            case ACTION.EMIT:
                return this.runEmit(action, state, emit);
            case ACTION.WAIT:
                return this.runWait(action, state, emit);
            case ACTION.DISCONNECT:
                return this.runDisconnect();
            default:
                throw new Error(`${action} is not supported by autoScript`);
        }
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

    setupWaitListeners() {
        const waitActions = uniqBy(
            this.actions.filter((action) => action.action === ACTION.WAIT),
            (action) => `${action.namespace} - ${action.type}`,
        );
        waitActions.forEach(({ namespace, type }) => {
            if (!namespace) {
                throw new Error(`Wait action for ${type} does not have a namespace`);
            }
            if (!type) {
                throw new Error(`Wait action does not have a type`);
            }
            this.getClient().on(namespace, type, () => () => {});
        });
    }

    onConnect(state, emit) {
        this.setupWaitListeners();
        this.attemptActions(state, emit);
    }

    onMessage(state, emit, type, namespace, data) {
        this.messages.push({
            type,
            namespace,
            data,
        });
        this.attemptActions(state, emit);
    }
}

module.exports = AutoScriptPlugin;
