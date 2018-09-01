import { StateManager } from './objects/stateManager';

/**
 * The container for all the data in the server.
 */

const manager: StateManager = {
    connections: {
        controllers: {},
        displays: {},
    },
    messages: [],
    rooms: {},
};

export default manager;
