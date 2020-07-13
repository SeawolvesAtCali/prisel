import debug from 'debug';
const info = debug('psl:info');
info.log = console.log.bind(console);
const warning = debug('psl:warning');
const severe = debug('psl:severe');

export const log = {
    info,
    warning,
    severe,
};
