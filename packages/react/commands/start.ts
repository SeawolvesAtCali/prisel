import { Packet, PacketType, MessageType } from '@prisel/client';
import { TypedCommand } from './TypedCommand';

export const start: TypedCommand = {
    title: 'start',
    tokens: [],
    code: () => {
        const startPacket: Packet = {
            type: PacketType.REQUEST,
            systemAction: MessageType.GAME_START,
        };
        return startPacket;
    },
};
