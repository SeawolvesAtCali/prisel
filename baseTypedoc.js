module.exports = {
    mode: 'file',
    out: 'apidoc',
    theme: 'markdown',
    ignoreCompilerErrors: 'true',
    excludeNotExported: 'true',
    excludePrivate: 'true',
    tsconfig: 'tsconfig.json',
};

// Make sure the entry file is listed in tsconfig.json files
// to run typdoc, make sure the project directory has a typedoc.js
