import { Server, debug } from './index';

const server = new Server();
process.stdout.write('starting server');

process.title = 'prisel-server';

process.on('exit', () => {
    debug('on exit');
    server.close();
});

process.on('SIGINT', () => {
    debug('on siginit');
    server.close();
    process.exit();
});
