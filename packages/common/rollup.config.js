import { browserBuild, cjsAndEsBuild } from '@prisel/configs/rollupHelper';
import pkg from './package.json';

export default [browserBuild(/* entry= */ 'dist/cjs/index.js', /* pkgJson= */ pkg)];
