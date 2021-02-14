import pkg from './package.json';
import { cjsAndEsBuild } from '@prisel/configs/rollupHelper';

export default [
    cjsAndEsBuild(
        /* entry= */ 'dist/server.js',
        /* pkgJson= */ pkg,
        /* additionalDeps= */ ['fs', 'path', 'assert'],
    ),
];
