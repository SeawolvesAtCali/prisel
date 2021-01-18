import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import Memory from 'lowdb/adapters/Memory';
import { defaultFlags } from './defaultFlags';

const db = low(
    process.env.NODE_ENV === 'development' ? new FileSync('.flags') : new Memory('.flags-memory'),
);

console.log('environment is development', process.env.NODE_ENV === 'development');

(db as any).defaults(defaultFlags).write();

export const flags = {
    // if the key doesn't exist, return undefined
    get<T>(key: string) {
        db.read();
        return (db as any).get(key).value();
    },
    set: (key: string, value: unknown) => {
        (db as any).update(key, () => value);
        return flags;
    },
};
