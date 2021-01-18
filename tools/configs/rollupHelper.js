const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

const nameRegex = /@prisel\/(.*)/;
/**
 * Convert the name in package.json, such as "@prisel/common" to output name of
 * the bundle, such as "priselCommon". This is mainly used by umd build to
 * provide a namespace for exported members.
 * @param {string} name
 */
function nameToOutputName(name) {
    const match = name.match(nameRegex);
    if (name.length === 2) {
        return `prisel${match[1].charAt(0).toUpperCase()}${match[1].slice(1)}`;
    }
    return 'prisel';
}
/**
 * Generate a browser umd build.
 * @param {string} entryFile the path to entry js file
 * @param {object} pkgJson the imported package.json object. The name and
 * pkgJson.browser is used to determin the output file
 */
function browserBuild(entryFile, pkgJson) {
    return {
        input: entryFile,
        output: {
            name: nameToOutputName(pkgJson.name),
            file: pkgJson.browser || './lib/index.umd.js',
            format: 'umd',
        },
        plugins: [
            resolve({
                // This is a browser module, should not use any node internal.
                preferBuiltins: false,
                mainFields: ['module', 'main', 'browser'],
            }), // so Rollup can find dependencies
            commonjs({
                namedExports: {
                    // protobufjs uses
                    //
                    // exports = protobufjs
                    // protobufjs.Writer = XX
                    //
                    // rollup was unable to understand
                    // import { Writer } from 'protobuffjs/minimal';
                    // So we need to use namedExports
                    'protobufjs/minimal': ['Writer', 'Reader'],
                },
            }), // so Rollup can convert dependencies to an ES module
        ],
    };
}

/**
 * Generate a Commonjs build and a ES module build. Exclude dependencies in
 * package.json from the build.
 * @param {string} entry Entry file path
 * @param {object} pkgJson Imported package.json object. pkgJson.main is the
 * commonjs output path. pkgJson.module is the ES module output path.
 */
function cjsAndEsBuild(entry, pkgJson, additionalDeps = [], includedDeps = []) {
    return {
        input: entry,
        external: (id) =>
            [...Object.keys(pkgJson.dependencies), ...additionalDeps]
                .filter((dep) => !(dep in includedDeps))
                .some((dep) => id === dep || id.startsWith(`${dep}/`)),
        output: [
            { file: pkgJson.main || './lib/index.cjs.js', format: 'cjs' },
            { file: pkgJson.module || './lib/index.esm.js', format: 'es' },
        ],
    };
}

module.exports = {
    browserBuild,
    cjsAndEsBuild,
};
