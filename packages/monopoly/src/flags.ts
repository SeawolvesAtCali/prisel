import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import Memory from 'lowdb/adapters/Memory';
import { defaultFlags } from './defaultFlags';

const db = low(
    process.env.NODE_ENV === 'development' ? new FileSync('.flags') : new Memory('.flags-memory'),
);

console.log('environemtn is development', process.env.NODE_ENV === 'development');

db.defaults(defaultFlags).write();

export const flags = {
    // if the key doesn't exist, return undefined
    get<T = any>(key: string) {
        db.read();
        return (db.get(key) as any).value();
    },
    set: (key: string, value: unknown) => db.update(key, () => value),
};
