import path from 'path';

const REGISTER_INSTANCE = Symbol.for('ts-node.register.instance');

/**
 * Expose `REGISTER_INSTANCE` information on node.js `process`.
 */
declare global {
    namespace NodeJS {
        interface Process {
            [REGISTER_INSTANCE]?: any;
        }
    }
}
// When built, the @prisel/monopoly-common/data folder will be copied to dist folder, the
// structure of dist folder is
//
// server.js
// common
//   - data
//
// this file will be bundled to server.js

const runningInTsNode: boolean = process[REGISTER_INSTANCE] !== undefined;

export const COMMON_DATA_DIR = runningInTsNode
    ? path.resolve(__dirname, '../monopoly-common/data')
    : path.resolve(__dirname, 'data');
