/**
 * This file demonstrates how to connect to server as a controller
 * and login
 */

const { connect, emitToServer } = require('./networkUtils');
const constants = require('../common/constants');
const { getLogin } = require('./roomMessages');

const connection = connect();

const controllerClient = connection.as(constants.CONTROLLER_NS);

controllerClient.on('LOGIN_ACCEPT', (data) => {
    console.log('client successfully login');
});

emitToServer(controllerClient, ...getLogin('superman'));
