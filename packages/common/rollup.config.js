// import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import pkg from './package.json';

const externalDependencyList = [...Object.keys(pkg.dependencies)];

export default [
    // browser-friendly UMD build
    {
        input: 'dist/index.js',
        output: {
            name: 'priselCommon',
            file: pkg.browser,
            format: 'umd',
        },
        plugins: [
            resolve({
                // This is a browser module, should not use any node internal.
                preferBuiltins: false,
            }), // so Rollup can find dependencies
            commonjs({
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
        external: (id) =>
            externalDependencyList.some((dep) => id === dep || id.startsWith(`${dep}/`)),

        output: [
            { file: pkg.main, format: 'cjs' },
            { file: pkg.module, format: 'es' },
        ],
    },

    {
        input: 'dist/actionConfigs.js',

        output: [{ file: './lib/actionConfigs.cjs.js', format: 'cjs' }],
    },
];
