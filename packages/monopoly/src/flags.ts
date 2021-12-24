import { JSONFileSync, LowSync, MemorySync } from 'lowdb';
import { join } from 'path';
import { defaultFlags } from './defaultFlags';

const adapter =
    process.env.NODE_ENV === 'development'
        ? new JSONFileSync<typeof defaultFlags>(join(__dirname, '.flags'))
        : new MemorySync<typeof defaultFlags>();

const db = new LowSync(adapter);

console.log('environment is development', process.env.NODE_ENV === 'development');

db.data = db.data || defaultFlags;
db.write();

export const flags = {
    get() {
        db.read();
        return db.data;
    },
};
