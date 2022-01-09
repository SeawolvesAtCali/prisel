import { debug, Server } from './index';

const close = Server.create();
process.stdout.write('starting server');

process.title = 'prisel-server';

process.on('exit', () => {
    debug('on exit');
    close();
});

process.on('SIGINT', () => {
    debug('on siginit');
    close();
    process.exit();
});
