import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

const config = [
    {
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
];

export default config;
