import { cjsAndEsBuild } from '@prisel/configs/rollupHelper';
import pkg from './package.json';

export default [cjsAndEsBuild(/* entry= */ 'dist/index.js', /* pkgJson= */ pkg)];
