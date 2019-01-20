const { Server, debug } = require('@prisel/server');

const server = new Server();
server.start();
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
