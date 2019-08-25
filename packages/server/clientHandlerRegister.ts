import { Context, Socket } from './objects';
import { string } from 'prop-types';
import { MessageType } from '@prisel/common';

export type Handler = (context: Context, socket: Socket) => (data: any) => void;

class ClientHandlerRegister {
    private map = new Map<MessageType, Handler>();
    public push(key: MessageType, handler: Handler) {
        this.map.set(key, handler);
    }

    public get(key: MessageType) {
        return this.map.get(key);
    }

    public get messageList() {
        return this.map.keys();
    }
}

export default new ClientHandlerRegister();
