import path from 'path';

// When built, the common/data folder will be copied to dist folder, the
// structure of dist folder is
//
// server.js
// common
//   - data
//
// this file will be bundled to server.js

export const COMMON_DATA_DIR = path.resolve(__dirname, 'common', 'data');
