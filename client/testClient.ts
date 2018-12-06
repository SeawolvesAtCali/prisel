import debug from './debug';
import * as roomMessages from '../client/message/room';
import * as chatMessages from '../client/message/chat';
import trim from 'lodash/trim';
import Client from './client';
import RoomType from '../common/message/room';
import readline from 'readline';

const client = new Client();
const rl = readline.createInterface(process.stdin, process.stdout);

function printHelp() {
    debug(
        `h: print help
m join roomId: join room
m create_room roomName: create a room
m leave: leave the room
m kick userId: kick a user
m ready: ready
m game_start: start game
q: disconnect
`,
    );
}

function handleMessage(
    emit: (message: string, data: object) => void,
    message: string,
    data: string,
): void {
    const trimData = data ? trim(data) : '';
    switch (message.toLowerCase()) {
        case 'join':
            return void emit(...roomMessages.getJoin(trimData));
        case 'create_room':
            return void emit(...roomMessages.getCreateRoom(trimData));
        case 'leave':
            return void emit(...roomMessages.getLeave());
        case 'kick':
            return void emit(...roomMessages.getKick(trimData));
        case 'ready':
            return void emit(...roomMessages.getReady());
        case 'unready':
            return void emit(...roomMessages.getUnready());
        case 'game_start':
            return void emit(...roomMessages.getStart());
    }
}

(async () => {
    await client.connect();
    client.login('batman');
    client.on(RoomType.SUCCESS, (data, state, emit) => {
        debug(RoomType.SUCCESS, data, state);
    });
    client.on(RoomType.ROOM_UPDATE, (data, state, emit) => {
        debug(RoomType.SUCCESS, data, state);
    });

    printHelp();

    const emitToServer = client.emit.bind(client);

    rl.on('line', (line) => {
        debug(`receive command "${line}"`);
        if (!trim(line)) {
            return;
        }
        const [, command, , message, data] = /(\w+)(\s+(\w+)\s?(.*)?)?/.exec(line);
        switch (command) {
            case 'h':
                return void printHelp();
            case 'm':
                return void handleMessage(emitToServer, message, data);
            case 'q':
                return void client.disconnect();
        }
    });
})();
