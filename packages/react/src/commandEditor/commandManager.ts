import preloadedCommands, { TypedCommand } from '../commands';

const STORAGE_KEY = 'command-scripts';

export interface Command {
    title: string;
    code: string;
    tokens: string[];
}

interface CommandMap {
    [title: string]: Command;
}

function each<T1, T2>(map: Map<T1, T2>, callback: (key: T1, value: T2) => void) {
    for (const [key, value] of Array.from(map)) {
        callback(key, value);
    }
}

export function isCommand(arg: any): arg is Command {
    if (typeof arg !== 'object' || arg === null) {
        return false;
    }
    return (
        typeof arg.title === 'string' && typeof arg.code === 'string' && Array.isArray(arg.tokens)
    );
}

function isCommandMap(arg: any): arg is CommandMap {
    if (typeof arg !== 'object' || arg === null) {
        return false;
    }
    return Object.entries(arg).every(([key, value]) => {
        return typeof key === 'string' && isCommand(value);
    });
}
function extractCommandsToObject<T>(map: Map<string, T>): { [key: string]: Command } {
    const result: { [key: string]: Command } = {};
    each(map, (key, value) => {
        if (isCommand(value)) {
            result[key] = value;
        }
    });
    return result;
}

function objectToMap<T>(object: { [key: string]: T }): Map<string, T> {
    const result = new Map<string, T>();
    for (const [key, value] of Object.entries(object)) {
        result.set(key, value);
    }
    return result;
}

function mergeMap<T1, T2>(map1: Map<string, T1>, map2?: Map<string, T2>): Map<string, T1 | T2> {
    const targetMap = new Map<string, T1 | T2>();
    // typescript seems to have issue with iterating over map directly
    // for (const [key, value] of map1) doesnt work
    each(map1, (key, value) => {
        targetMap.set(key, value);
    });

    if (map2) {
        each(map2, (key, value) => {
            targetMap.set(key, value);
        });
    }
    return targetMap;
}

export class CommandManager {
    private commands: Map<string, Command | TypedCommand>;
    private cached: Array<Command | TypedCommand> = [];
    private storage: Storage;

    constructor(storage: Storage) {
        this.storage = storage;
        const savedCommandMapString: string = this.storage.getItem(STORAGE_KEY) || '{}';
        const parsedCommandMap = JSON.parse(savedCommandMapString);
        if (isCommandMap(parsedCommandMap)) {
            this.commands = mergeMap(preloadedCommands, objectToMap(parsedCommandMap));
        } else {
            this.commands = mergeMap(preloadedCommands);
        }
        this.cacheAll();
    }

    private preserve() {
        this.storage.setItem(STORAGE_KEY, JSON.stringify(extractCommandsToObject(this.commands)));
    }

    public add(title: string, code: string, tokens: string[]) {
        this.commands.set(title, {
            title,
            code,
            tokens,
        });
        this.preserve();
        this.cacheAll();
    }

    public refresh() {
        // do nothing;
    }

    public delete(title: string) {
        this.commands.delete(title);
        this.preserve();
        this.cacheAll();
    }

    private cacheAll() {
        this.cached = Array.from(this.commands.values());
    }

    public getAll(): Array<Command | TypedCommand> {
        return this.cached;
    }
}

export default new CommandManager(window.localStorage);
