import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
// import sucrase from '@rollup/plugin-sucrase';
import pkg from './package.json';

export default [
    // browser-friendly UMD build
    {
        input: 'dist/index.js',
        output: {
            name: 'priselProtos',
            file: pkg.browser,
            format: 'umd',
        },
        plugins: [
            resolve({
                // This is a browser module, should not use any node internal.
                preferBuiltins: false,
            }), // so Rollup can find dependencies
            commonjs({
                // Protobuf code uses the following
                // var protobuf = exports;
                // protobuf.Writer = ...
                //
                // And we try to import Writer using
                // import {Writer} from 'protobufjs/minimal';
                // Unfortunately rollup was unable to see Writer
                namedExports: {
                    'protobufjs/minimal': ['Writer', 'Reader'],
                },
            }), // so Rollup can convert dependencies to an ES module
        ],
    },

    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // an array for the `output` option, where we can specify
    // `file` and `format` for each target)
    {
        input: 'dist/index.js',
        output: [
            { file: pkg.main, format: 'cjs' },
            { file: pkg.module, format: 'es' },
        ],
    },
];
