const rootPkg = require('./package.json');
const path = require('path');
const fs = require('fs');
const prettier = require('prettier');

const prettierConfig = rootPkg.prettier;

const packages = Object.keys(rootPkg.dependencies).map(
    (packageName) => packageName.match(/^@prisel\/(.*)$/)[1],
);

const devDependencyMap = new Map();

Object.entries(rootPkg.devDependencies).forEach((entry) => {
    devDependencyMap.set(entry[0], entry[1]);
});

function updateDependencies(dependencies) {
    Object.keys(dependencies || {}).forEach((dep) => {
        if (devDependencyMap.has(dep)) {
            dependencies[dep] = devDependencyMap.get(dep);
        }
    });
}

function updatePackageJson(pkgJsonPath) {
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath).toString());
    updateDependencies(pkgJson.dependencies);
    updateDependencies(pkgJson.devDependencies);
    updateDependencies(pkgJson.peerDependencies);
    const formattedPkgJson = prettier.format(JSON.stringify(pkgJson), {
        ...prettierConfig,
        parser: 'json-stringify',
    });
    fs.writeFileSync(pkgJsonPath, formattedPkgJson, 'utf-8');
}

packages.forEach((pkg) => {
    const packageJsonPath = path.resolve(__dirname, 'packages', pkg, 'package.json');
    updatePackageJson(packageJsonPath);
});
