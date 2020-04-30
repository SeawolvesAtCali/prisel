const fs = require('fs');
const path = require('path');

// generate index.ts file in images folder

fs.promises.readdir('./images').then((filenames) => {
    const pngFiles = filenames.filter((filename) => filename.endsWith('png'));
    const comment =
        '// Do not edit. This file is auto generated using gernateDeclaration.js script.\n' +
        '// Run "npx lerna run build --scope @prisel/map-creator" to regenerate\n';
    const imports = pngFiles
        .map((file, index) => `import sprite${index} from './${file}';\n`)
        .join('');
    const files = pngFiles.map((file) => path.basename(file, '.png'));
    const filenameType = `export type AllFileName =\n${files
        .map((file) => `    | '${file}'`)
        .join('\n')};\n`;
    const mapDeclaration = `const map: Map<AllFileName, string> = new Map();\n`;
    const addToMaps = pngFiles
        .map((file, index) => `map.set('${path.basename(file, '.png')}', sprite${index});\n`)
        .join('');

    const exportStatement = `export default map;\n`;
    fs.promises.writeFile(
        './images/index.ts',
        [comment, imports, filenameType, mapDeclaration, addToMaps, exportStatement].join('\n'),
    );
});
