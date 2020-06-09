const fs = require('fs');
const path = require('path');

const BASE_CONFIG_NAME = 'tsconfig';
const BUILD_CONFIG_NAME = 'build.tsconfig';
const DEMO_CONFIG_NAME = 'demo.tsconfig';
const DEFAULT_OUT_DIR = './lib';
const ROOT_DIR = './';

function readJson(file) {
    return fs.promises
        .readFile(file, 'utf8')
        .then((buffer) => {
            return JSON.parse(buffer.toString());
        })
        .catch((err) => {
            console.error('read package.json failed', err);
        });
}

/**
 * Generate the following based on the genTsconfig field in package.json.
 *
 * build.tsconfig.json: tsconfig used for `npm run build`, if  `files` is specified
 * tsconfig.json: tsconfig in the root of the project, used by vscode (this
 *      doesn't have `include` or `files`)
 * demo.tsconfig.json: tsconfig used by ts-node to run the server in development
 *
 * genTsconfig can have the following fields
 *
 * files: Array<string> the files to include in the `npm run build` process
 * outDir: output directory used by `npm run build`. Default to `./lib`,
 * genDemo: true/false, default false, whether to generate demo.tsconfig.json
 * genJs: generate js file when `npm run build`
 *
 * @param {object} pkgJson The package.json object
 * @param {string} projectRootDir The absolute path of package.json file
 */
function genTsconfig(pkgJson, projectRootDir) {
    const genTsconfig = pkgJson.genTsconfig;
    if (!genTsconfig) {
        throw new Error('package.json should have a genTsconfig field');
    }
    const { files, outDir, genDemo, genJs } = genTsconfig;

    const baseConfig = {
        extends: '../../tsconfig',
        compilerOptions: {
            rootDir: ROOT_DIR,
            noEmit: true,
        },
        exclude: ['node_modules', '**/lib'],
    };

    outputTsconfig(baseConfig, path.resolve(projectRootDir, BASE_CONFIG_NAME + '.json'));

    if (files) {
        // should generate build.tsconfig.json
        const buildConfig = { ...baseConfig };
        buildConfig.files = files;
        buildConfig.compilerOptions = { ...buildConfig.compilerOptions, noEmit: false };
        buildConfig.compilerOptions.outDir = outDir ? outDir : DEFAULT_OUT_DIR;
        if (!genJs) {
            buildConfig.compilerOptions.emitDeclarationOnly = true;
        }
        outputTsconfig(buildConfig, path.resolve(projectRootDir, BUILD_CONFIG_NAME + '.json'));
    }

    if (genDemo) {
        // should generate demo.tsconfig.json
        const demoConfig = {
            ...baseConfig,
            extends: './tsconfig',
        };
        demoConfig.compilerOptions = {
            ...baseConfig.compilerOptions,
            module: 'commonjs',
        };
        outputTsconfig(demoConfig, path.resolve(projectRootDir, DEMO_CONFIG_NAME + '.json'));
    }
}

function outputTsconfig(config, filePath) {
    fs.writeFileSync(filePath, JSON.stringify(config, null, 4));
}

function execute() {
    const rootDir = process.cwd();
    readJson(path.resolve(rootDir, 'package.json')).then((pkgJson) =>
        genTsconfig(pkgJson, rootDir),
    );
}

module.exports = execute;
