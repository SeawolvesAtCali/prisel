// @flow

const path = require('path');
const { run, runScript } = require('./scriptRunner');

const server = run(path.resolve(__dirname, '../server/index.js'), {
    maxTimeout: 8000,
});

runScript(path.resolve(__dirname, '../client/autoScripts/autoCreateRoomScript.js'), () => {
    server.kill();
});
