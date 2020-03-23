import dts from 'rollup-plugin-dts';

const config = [
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
