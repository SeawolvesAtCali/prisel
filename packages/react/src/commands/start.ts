import { Request } from '@prisel/client';
import { priselpb } from '@prisel/protos';
import { TypedCommand } from './TypedCommand';

export const start: TypedCommand = {
    title: 'start',
    tokens: [],
    code: () => {
        const startPacket = Request.forSystemAction(priselpb.SystemActionType.GAME_START).build();
        return startPacket;
    },
};
