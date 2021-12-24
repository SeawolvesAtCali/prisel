const { defaults: tsjPreset } = require('ts-jest/presets');
/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    // preset: 'ts-jest',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.json',
        },
    },
    transform: {
        ...tsjPreset.transform,
    },
    testEnvironment: 'node',
    verbose: true, // Indicates whether each individual test should be reported during the run.
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    testRegex: '.test\\.[tj]s$',
    restoreMocks: true,
    clearMocks: true,
    // Use stdout for logging, only use stderr for error.
    // TODO(minor) Although this seems to conflict with TestEnvironment in e2e. With
    // TestEnvironment, we still output to stderr.
    reporters: ['jest-standard-reporter'],
    testEnvironment: 'node',
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.json',
        },
    },
};
