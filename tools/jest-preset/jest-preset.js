module.exports = {
    verbose: true,
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.json',
        },
    },
    transform: {
        '^.+\\.(ts)$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    testRegex: '.test\\.[tj]s$',
    restoreMocks: true,
    clearMocks: true,
    // Use stdout for logging, only use stderr for error.
    // TODO(minor) Although this seems to conflict with TestEnvironment in e2e. With
    // TestEnvironment, we still output to stderr.
    reporters: ['jest-standard-reporter'],
    testEnvironment: 'node',
};
