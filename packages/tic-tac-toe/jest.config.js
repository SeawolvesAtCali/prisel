module.exports = {
    name: 'tic-tac-toe',
    displayName: 'tic-tac-toe',
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
    testRegex: '.test\\.ts$',
    restoreMocks: true,
    clearMocks: true,
};
