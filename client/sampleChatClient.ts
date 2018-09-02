/**
 * This file demonstrates how to connect to chat server
 */

import debug from './debug';
import { connect, emitToServer } from './networkUtils';
import * as constants from '../common/constants';
import { getLogin } from './message/room';
import readline from 'readline';
import * as chatMessages from './message/chat';

let user = '';
const connection = connect();
const controllerClient = connection.as(constants.CONTROLLER_NS);
const chatClient = connection.as(constants.CHAT_NS);
const generalClient = connection.as('');

generalClient.on('LOGIN_ACCEPT', (data: object) => {
    debug('general client receive login_accept', data);
});

const rl = readline.createInterface(process.stdin, process.stdout);

controllerClient.on('LOGIN_ACCEPT', (data: any) => {
    // sessionStorage.setItem('userId', data.userId); // for browser
    debug(user, ' successfully login');
    user = data.userId;
    // display what server send
    chatClient.on('BROADCAST', (message: { username: string; message: string }) => {
        debug(message.username, ': ', message.message);
    });
    rl.on('line', (line) => {
        emitToServer(chatClient, ...chatMessages.getChat(user, line));
        rl.prompt(true);
        debug(user, ': ', line);
    });
});

emitToServer(controllerClient, ...getLogin('superman'));
