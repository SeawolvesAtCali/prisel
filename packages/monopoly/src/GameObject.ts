import { Handle } from '@prisel/server';
import { sign } from './secret';

abstract class GameObject {
    public id: string;
    protected secret: string;
    protected handle: Handle;

    public setSecret(secret: string) {
        this.secret = secret;
    }

    public setHandle(handle: Handle) {
        this.handle = handle;
    }

    public sign(payload: object) {
        return sign(payload, this.secret);
    }
}

export default GameObject;
