import { endState } from '@prisel/state';
import { debug, Server } from './index';

const close = Server.create({
    onCreateGame: () => () => endState(),
});
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
