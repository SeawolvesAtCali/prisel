// import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import path from 'path';

const externalDependencyList = [...Object.keys(pkg.dependencies)];

const config = [
    {
        input: 'server.ts',
        external: (id) =>
            externalDependencyList.some((dep) => id === dep || id.startsWith(`${dep}/`)),
        plugins: [
            // resolve({
            //     // need to specify preferBuiltins
            //     // https://github.com/rollup/rollup-plugin-node-resolve/issues/196
            //     preferBuiltins: true,
            // }), // so Rollup can find dependencies

            typescript({
                tsconfigOverride: {
                    compilerOptions: {
                        declaration: false,
                    },
                },
            }), // so Rollup can convert TypeScript to JavaScript
            copy({
                targets: [
                    {
                        src: '../monopoly-common/data/*',
                        dest: 'dist/data',
                    },
                ],
            }),
        ],
        output: [{ file: './dist/server.js', format: 'cjs' }],
    },
];

export default config;
