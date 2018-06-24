const debug = require('debug')('debug');
const Client = require('./client');
const constants = require('../common/constants');
const AutoScriptPlugin = require('./autoScriptPlugin');
const program = require('commander');

// parse command line argument
program.option('-s, --script [path]', 'use an auto script').parse(process.argv);

const { CONTROLLER_NS: CONTROLLER, CHAT_NS: CHAT } = constants;
const client = new Client(CONTROLLER, CHAT);

if (program.script) {
    let script;
    try {
        script = require(program.script);
    } catch (error) {
        debug(`Cannot load script ${program.script}`);
    }
    if (script) {
        debug(`successfully loaded script ${program.script}`);
        client.addPlugin(new AutoScriptPlugin(script));
    }
}
client.connect();
