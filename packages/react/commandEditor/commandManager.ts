const STORAGE_KEY = 'command-scripts';

export interface Command {
    title: string;
    code: string;
    tokens: string[];
}

interface CommandMap {
    [title: string]: Command;
}

class CommandManager {
    private commands: CommandMap = {};
    private storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
        this.commands = (JSON.parse(storage.getItem(STORAGE_KEY)) || {}) as CommandMap;
    }

    private preserve() {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(this.commands));
    }

    public add(title: string, code: string, tokens: string[]) {
        this.commands[title] = {
            title,
            code,
            tokens,
        };
        this.preserve();
    }

    public delete(title: string) {
        delete this.commands[title];
        this.preserve();
    }

    public getAll(): Command[] {
        return (Object as any).values(this.commands);
    }
}

export default new CommandManager(window.localStorage);
