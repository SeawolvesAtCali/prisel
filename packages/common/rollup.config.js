import { browserBuild, cjsAndEsBuild } from '@prisel/configs/rollupHelper';
import pkg from './package.json';

export default [
    browserBuild(/* entry= */ 'dist/index.js', /* pkgJson= */ pkg),
    cjsAndEsBuild(/* entry= */ 'dist/index.js', /* pkgJson= */ pkg),
    {
        input: 'dist/actionConfigs.js',
        output: [{ file: './lib/actionConfigs.cjs.js', format: 'cjs' }],
    },
];
