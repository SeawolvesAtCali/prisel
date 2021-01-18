import { Packet } from '@prisel/common';
import { system_action_type } from '@prisel/protos';
import { Context, Socket } from './objects';

export type Handler = (context: Context, socket: Socket) => (data: Packet) => void;

class SystemActionHandlerRegister {
    private map = new Map<system_action_type.SystemActionType, Handler>();
    public push(key: system_action_type.SystemActionType, handler: Handler) {
        this.map.set(key, handler);
    }

    public get(key: system_action_type.SystemActionType) {
        return this.map.get(key);
    }

    public get messageList() {
        return this.map.keys();
    }
}

export default new SystemActionHandlerRegister();
