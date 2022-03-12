const { Server, debug } = require('@prisel/server');

const close = Server.create({ host: 'localhost', port: 3000 });
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
