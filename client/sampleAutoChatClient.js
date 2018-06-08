const Client = require('./client');
const constants = require('../common/constants');
const ReadLinePlugin = require('./readlinePlugin');

const { CONTROLLER_NS: CONTROLLER, CHAT_NS: CHAT } = constants;
const client = new Client(CONTROLLER, CHAT);

client.addPlugin(new ReadLinePlugin());

client.connect();

client.on(CHAT, 'BROADCAST', (state, emit) => (message) => {
    if (state.isLoggedIn) {
        console.log(message.username, ': ', message.message);
    }
});
