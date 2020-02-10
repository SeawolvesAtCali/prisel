const { Server, debug } = require('@prisel/server');

const server = Server.create({ host: 'localhost', port: 3000 });
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
