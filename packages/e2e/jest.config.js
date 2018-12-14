module.exports = {
    name: 'e2e',
    displayName: 'e2e',
    verbose: true,
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.json',
        },
    },
    moduleFileExtensions: ['ts', 'js'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    testRegex: '.test\\.ts$',
    restoreMocks: true,
    clearMocks: true,
    testEnvironment: './TestEnvironment.js',
};
