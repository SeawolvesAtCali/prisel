/**
 * This file demonstrates how to connect to chat server
 */

const debug = require('debug')('debug');
const { connect, emitToServer } = require('./networkUtils');
const constants = require('../common/constants');
const { getLogin } = require('./message/room');
const readline = require('readline');
const chatMessages = require('./message/chat');

let user = '';
const connection = connect();
const controllerClient = connection.as(constants.CONTROLLER_NS);
const chatClient = connection.as(constants.CHAT_NS);

const rl = readline.createInterface(process.stdin, process.stdout);

controllerClient.on('LOGIN_ACCEPT', (data) => {
    // sessionStorage.setItem('userId', data.userId); // for browser
    debug(user, ' successfully login');
    user = data.userId;
    // display what server send
    chatClient.on('BROADCAST', (message) => {
        debug(message.username, ': ', message.message);
    });
    rl.on('line', (line) => {
        emitToServer(chatClient, ...chatMessages.getMessage(user, line));
        rl.prompt(true);
        debug(user, ': ', line);
    });
});

emitToServer(controllerClient, ...getLogin('superman'));
