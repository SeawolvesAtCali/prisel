const debug = require('debug')('debug');
const Client = require('./client');
const constants = require('../common/constants');
const ReadLinePlugin = require('./readlinePlugin');
const AutoScriptPlugin = require('./autoScriptPlugin');
const program = require('commander');

// parse command line argument
program.option('-s, --script [path]', 'use an auto script').parse(process.argv);

const { CONTROLLER_NS: CONTROLLER, CHAT_NS: CHAT } = constants;
const client = new Client(CONTROLLER, CHAT);

client.addPlugin(new ReadLinePlugin());

if (program.script) {
    let script;
    try {
        script = require(program.script);
    } catch (error) {
        debug(`Cannot load script ${program.script}`);
    }
    if (script) {
        client.addPlugin(new AutoScriptPlugin(script));
    }
}
client.connect();

client.on(CHAT, 'BROADCAST', (state, emit) => (message) => {
    if (state.isLoggedIn) {
        console.log(message.username, ': ', message.message);
    }
});
