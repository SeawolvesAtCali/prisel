const Types = require('./baseTypes');
const { isClient } = require('./client');

const stateManagerSchema = {
    connections: Types.isObjectShape({
        controllers: Types.isObjectOf(isClient),
        display: Types.isObjectOf(isClient),
    }),
};

function isStateManager(value) {
    return Types.isObjectShape(stateManagerSchema)(value, 'STATE_MANAGER');
}

module.exports = { isStateManager };
