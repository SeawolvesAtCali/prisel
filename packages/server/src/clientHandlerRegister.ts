import { Packet } from '@prisel/common';
import { priselpb } from '@prisel/protos';
import { Context, Socket } from './objects';

export type Handler = (context: Context, socket: Socket) => (data: Packet) => void;

class SystemActionHandlerRegister {
    private map = new Map<priselpb.SystemActionType, Handler>();
    public push(key: priselpb.SystemActionType, handler: Handler) {
        this.map.set(key, handler);
    }

    public get(key: priselpb.SystemActionType) {
        return this.map.get(key);
    }

    public get messageList() {
        return this.map.keys();
    }
}

export default new SystemActionHandlerRegister();
