import readline from 'readline';
import { CHAT_NS } from '../common/constants';
import { getChat } from './message/chat';

class ReadlinePlugin {
    private rl: readline.ReadLine;

    constructor() {
        this.rl = readline.createInterface(process.stdin, process.stdout);
    }

    public onConnect(state: { userId: string }, emit: (...props: any[]) => void) {
        this.rl.prompt(true);
        this.rl.on('line', (line) => {
            emit(CHAT_NS, ...getChat(state.userId, line));
            this.rl.prompt(true);
        });
    }
    public onMessage() {
        // start a new line
        this.rl.prompt(true);
    }
}

export default ReadlinePlugin;
