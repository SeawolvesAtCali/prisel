const JSDomEnvironment = require('jest-environment-jsdom');
const path = require('path');
const { setup: setupDevServer, teardown: teardownDevServer } = require('jest-dev-server');

class TestEnvironment extends JSDomEnvironment {
    async setup() {
        await super.setup();
        if (typeof this.global.TextEncoder === 'undefined') {
            const { TextEncoder } = require('util');
            this.global.TextEncoder = TextEncoder;
        }
        await setupDevServer({
            command: `node ${path.resolve(__dirname, './server.js')}`,
            launchTimeout: 5000,
            port: 3000,
        });
    }

    async teardown() {
        await teardownDevServer();
        await super.teardown();
    }
}

module.exports = TestEnvironment;
