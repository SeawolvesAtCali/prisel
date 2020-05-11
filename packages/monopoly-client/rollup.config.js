import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

function buildJs(input, file) {
    return {
        input,
        output: [{ file, format: 'cjs' }],
        plugins: [
            resolve({
                // need to specify preferBuiltins
                // https://github.com/rollup/rollup-plugin-node-resolve/issues/196
                preferBuiltins: true,
            }), // so Rollup can find dependencies
            commonjs(), // so Rollup can convert dependencies to an ES module
        ],
    };
}

function buildDef(input, file) {
    return {
        input,
        output: [
            {
                file,
                format: 'es',
            },
        ],
        plugins: [dts()],
    };
}

const config = [
    buildJs('priselClient.js', 'assets/Script/packages/priselClient.js'),
    buildDef('../client/lib/index.d.ts', 'assets/Script/packages/priselClient.d.ts'),
    buildJs('monopolyCommon.js', 'assets/Script/packages/monopolyCommon.js'),
    buildDef('../monopoly/lib/index.d.ts', 'assets/Script/packages/monopolyCommon.d.ts'),
    {
        input: 'resource.js',
        output: {
            file: 'assets/Script/packages/resource.js',
            format: 'cjs',
        },
        plugins: [
            copy({
                targets: [{ src: '../monopoly/common/data/*', dest: 'assets/resources' }],
            }),
        ],
    },
];

export default config;
