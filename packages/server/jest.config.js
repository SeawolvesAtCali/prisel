module.exports = {
    name: 'server',
    displayName: 'server',
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
    testRegex: '__test__/.+.test\\.ts$',
    restoreMocks: true,
    clearMocks: true,
};
