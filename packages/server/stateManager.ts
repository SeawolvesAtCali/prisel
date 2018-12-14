import { StateManager } from './objects/stateManager';

/**
 * The container for all the data in the server.
 */

function createStateManager(): StateManager {
    return {
        connections: {},
        messages: [],
        rooms: {},
    };
}

export default createStateManager;
