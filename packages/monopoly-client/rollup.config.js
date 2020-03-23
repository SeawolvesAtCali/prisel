import dts from 'rollup-plugin-dts';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

const config = [
    {
        input: 'priselClient.js',
        output: [
            { file: 'assets/Script/packages/priselClient.js', format: 'umd', name: 'priselClient' },
        ],
        plugins: [
            resolve({
                // need to specify preferBuiltins
                // https://github.com/rollup/rollup-plugin-node-resolve/issues/196
                preferBuiltins: true,
            }), // so Rollup can find dependencies
            commonjs(), // so Rollup can convert dependencies to an ES module
        ],
    },
    {
        input: '../client/lib/index.d.ts',
        output: [
            {
                file: 'assets/Script/packages/priselClient.d.ts',
                format: 'es',
            },
        ],
        plugins: [dts()],
    },
];

export default config;
