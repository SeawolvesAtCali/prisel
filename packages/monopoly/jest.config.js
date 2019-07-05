module.exports = {
    name: 'monopoly',
    displayName: 'monopoly',
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
