import debug from './debug';
import { connect, emitToServer } from './networkUtils';
import { CONTROLLER_NS, CHAT_NS, DISPLAY_NS } from '../common/constants';
import * as roomMessages from '../client/message/room';
import * as chatMessages from '../client/message/chat';
import trim from 'lodash/trim';
import Client from './client';
import RoomType from '../common/message/room';
import readline from 'readline';

const client = new Client(CONTROLLER_NS, CHAT_NS, DISPLAY_NS);
const rl = readline.createInterface(process.stdin, process.stdout);

function printHelp() {
    console.log(
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

function handleMessage(client: Client, message: string, data: string): void {
    const trimData = data ? trim(data) : '';
    switch (message.toLowerCase()) {
        case 'join':
            return void client.emit(CONTROLLER_NS, ...roomMessages.getJoin(trimData));
        case 'create_room':
            return void client.emit(CONTROLLER_NS, ...roomMessages.getCreateRoom(trimData));
        case 'leave':
            return void client.emit(CONTROLLER_NS, ...roomMessages.getLeave());
        case 'kick':
            return void client.emit(CONTROLLER_NS, ...roomMessages.getKick(trimData));
        case 'ready':
            return void client.emit(CONTROLLER_NS, ...roomMessages.getReady());
        case 'unready':
            return void client.emit(CONTROLLER_NS, ...roomMessages.getUnready());
        case 'game_start':
            return void client.emit(CONTROLLER_NS, ...roomMessages.getStart());
    }
}

(async () => {
    await client.connect();
    client.login('batman');
    client.on(CONTROLLER_NS, RoomType.SUCCESS, (data, state, emit) => {
        debug(RoomType.SUCCESS, data, state);
    });
    client.on(CONTROLLER_NS, RoomType.ROOM_UPDATE, (data, state, emit) => {
        debug(RoomType.SUCCESS, data, state);
    });

    printHelp();

    rl.on('line', (line) => {
        console.log(`receive command "${line}"`);
        if (!trim(line)) {
            return;
        }
        const [, command, , message, data] = /(\w+)(\s+(\w+)\s?(.*)?)?/.exec(line);
        switch (command) {
            case 'h':
                return void printHelp();
            case 'm':
                return void handleMessage(client, message, data);
            case 'q':
                return void client.disconnect();
        }
    });
})();
