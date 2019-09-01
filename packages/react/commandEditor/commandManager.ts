const STORAGE_KEY = 'command-scripts';

export interface Command {
    title: string;
    code: string;
    tokens: string[];
}

interface CommandMap {
    [title: string]: Command;
}

export class CommandManager {
    private commands: CommandMap = {};
    private cachedCommand: Command[];
    private storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
        this.refresh();
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
        this.cachedCommand = Object.values(this.commands);
        this.preserve();
    }

    public refresh() {
        this.commands = (JSON.parse(this.storage.getItem(STORAGE_KEY)) || {}) as CommandMap;
        this.cachedCommand = Object.values(this.commands);
    }

    public delete(title: string) {
        delete this.commands[title];
        this.cachedCommand = Object.values(this.commands);
        this.preserve();
    }

    public getAll(): Command[] {
        return this.cachedCommand;
    }
}

export default new CommandManager(window.localStorage);
