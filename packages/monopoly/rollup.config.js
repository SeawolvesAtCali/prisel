// import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import copy from 'rollup-plugin-copy';
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

const externalDependencyList = [...Object.keys(pkg.dependencies)];

const config = [
    {
        // exporting common for monopoly-client. This should probably be broken
        // into a separate package
        input: 'index.ts',
        plugins: [
            typescript({
                tsconfigOverride: {
                    compilerOptions: {
                        declaration: false,
                    },
                },
            }),
        ],
        output: [{ file: pkg.main, format: 'cjs' }],
    },
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
            json(),
            typescript({
                tsconfigOverride: {
                    compilerOptions: {
                        declaration: false,
                    },
                },
            }), // so Rollup can convert TypeScript to JavaScript
            copy({
                targets: [{ src: 'common/data/*', dest: 'dist/common/data' }],
            }),
        ],
        output: [{ file: './dist/server.js', format: 'cjs' }],
    },
];

export default config;
