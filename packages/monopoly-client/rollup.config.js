import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

function buildJs(input, file, ...otherPlugins) {
    return {
        input,
        output: [{ file, format: 'cjs' }],
        plugins: [
            resolve(),
            commonjs(), // so Rollup can convert dependencies to an ES module
            ...otherPlugins,
        ],
    };
}

function buildDef(input, file, ...otherPlugins) {
    return {
        input,
        output: [
            {
                file,
                format: 'es',
            },
        ],
        plugins: [dts(), ...otherPlugins],
    };
}

const config = [
    buildJs('priselClient.js', 'assets/Script/packages/priselClient.js'),
    buildDef('priselClient.d.ts', 'assets/Script/packages/priselClient.d.ts'),
    buildJs('monopolyCommon.js', 'assets/Script/packages/monopolyCommon.js'),
    buildDef(
        'monopolyCommon.d.ts',
        'assets/Script/packages/monopolyCommon.d.ts',
        // piggy back the copy command to a target, because it needs to have an input.
        copy({
            targets: [{ src: '../monopoly-common/data/*', dest: 'assets/resources' }],
        }),
    ),
];

export default config;
