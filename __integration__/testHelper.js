const constants = require('../common/constants');
const Client = require('../client/client');

function createClients(num = 1, namespaces = [constants.CONTROLLER_NS]) {
    return Array.from({ length: num }).map(() => new Client(...namespaces));
}

module.exports = {
    createClients,
};
