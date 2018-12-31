module.exports = {
    name: 'tic-tac-toe-client',
    displayName: 'tic-tac-toe-client',
    verbose: true,
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.json',
        },
    },
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    transform: {
        '^.+\\.ts(x)?$': 'ts-jest',
    },
    testRegex: '.test\\.js$',
    restoreMocks: true,
    clearMocks: true,
};
