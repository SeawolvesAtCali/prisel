import { Request } from '@prisel/client';
import { system_action_type } from '@prisel/protos';
import { TypedCommand } from './TypedCommand';

export const start: TypedCommand = {
    title: 'start',
    tokens: [],
    code: () => {
        const startPacket = Request.forSystemAction(
            system_action_type.SystemActionType.GAME_START,
        ).build();
        return startPacket;
    },
};
