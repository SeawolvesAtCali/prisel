// @flow
import type { StateManagerT } from './objects/stateManager';

/**
 * The container for all the data in the server.
 */

const manager: StateManagerT = {
    connections: {
        controllers: {},
        displays: {},
    },
    messages: [],
    rooms: {},
};

module.exports = manager;
