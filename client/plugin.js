// @flow
import type { ClientClass } from './client';

/**
 * Base class for plugin.
 */
class Plugin {
    client: ClientClass;

    getClient() {
        return this.client;
    }

    setClient(client: ClientClass) {
        this.client = client;
    }

    /**
     * Callback fired when the client is connected and logged in
     * @param {object} state client state
     * @param {function} emit function to emit to server
     */
    onConnect(state: {}, emit: any) {}

    /**
     * Callback fired when client receives a message
     * @param {object} state client state
     * @param {function} emit function to emit to server
     * @param {string} type message type
     * @param {string} namespace namespace the message is from
     * @param {object} data data of the message
     */
    onMessage(state: {}, emit: any, type: string, namespace: string, data: {}) {}
}

module.exports = Plugin;

export type PluginClass = Plugin;
