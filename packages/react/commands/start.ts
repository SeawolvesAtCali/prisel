import { Messages } from '@prisel/client';
import { TypedCommand } from './TypedCommand';

export const start: TypedCommand = {
    title: 'start',
    tokens: [],
    code: () => {
        const [messageType, payload] = Messages.getGameStart();
        return {
            type: messageType,
            payload,
        };
    },
};
