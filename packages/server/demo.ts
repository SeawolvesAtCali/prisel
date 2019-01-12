import Server from './server';
import debug from './debug';
import { BaseGameConfig } from './utils/gameConfig';
import { BaseRoomConfig } from './utils/roomConfig';

const server = new Server();
server.register(BaseGameConfig, BaseRoomConfig);
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
