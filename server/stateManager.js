/**
 * The container for all the data in the server.
 */

const manager = {
    connections: {
        controllers: [],
        displays: [],
    },
    messages: [],
    rooms: {},
};

module.exports = manager;
