const Client = require('../client');

describe('Client', () => {
    describe('constructor', () => {
        it('should instantiate', () => {
            expect(() => new Client()).not.toThrow();
        });
    });
});
