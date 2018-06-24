const readline = require('readline');
const { CHAT_NS } = require('../common/constants');
const { getChat } = require('./message/chat');
const Plugin = require('./plugin');

class ReadlinePlugin extends Plugin {
    constructor() {
        super();
        this.rl = readline.createInterface(process.stdin, process.stdout);
    }

    onConnect(state, emit) {
        this.rl.prompt(true);
        this.rl.on('line', (line) => {
            emit(CHAT_NS, ...getChat(state.userId, line));
            this.rl.prompt(true);
        });
    }
    onMessage() {
        // start a new line
        this.rl.prompt(true);
    }
}

module.exports = ReadlinePlugin;
