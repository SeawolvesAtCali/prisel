# `@prisel/template`

> A template for creating new package

## Usage

1. Make a copy of this module
2. Change the project name in `package.json`
3. Change the test name in `jest.config.js`
4. Install in main package.json `npm install ./packages/<name>`.

### Install dependencies

Install dependency at the root project using lerna

```
> npx lerna add <dependency> --scope @prisel/<package-name>
```

If you see root package.json already has the package we need, try installing the same version

```
> npx lerna add <dependency>@^16.6.3 --scope @prisel/<package-name>
```

Lerna only supports adding one dependency at a time.

### Install devDependencies

DevDependencies are installed at root project only.

```
> npm i -D eslint
```

If we need to add devDependencies to sub packages, copy the name and version to sub package
`package.json`, no installation is needed.

If you want to use lerna to do that

```
> npx lerna add --dev <dependency> --scope @prisle/<package-name>
```
