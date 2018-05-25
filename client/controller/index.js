const network = require('../networkUtils');
const constants = require('../../common/constants');

// eslint-disable-next-line no-unused-vars
function startController() {
    const connection = network.connect().as(constants.CONTROLLER_NS);
    return connection;
}
