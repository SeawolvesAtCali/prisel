import debug from 'debug';
const verbose = debug('psl:verbose');
const info = debug('psl:info');
info.log = console.log.bind(console);
const warning = debug('psl:warning');
const severe = debug('psl:severe');

export const log = {
    verbose,
    info,
    warning,
    severe,
};
