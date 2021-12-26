import { priselpb } from '@prisel/protos';
import clientHandlerRegister from '../../clientHandlerRegister';
import '../index';

const systemActionsWithoutHandler = new Set([
    priselpb.SystemActionType.UNSPECIFIED,
    priselpb.SystemActionType.WELCOME,
    priselpb.SystemActionType.BROADCAST,
    priselpb.SystemActionType.ROOM_STATE_CHANGE,
    priselpb.SystemActionType.ANNOUNCE_GAME_START,
    priselpb.SystemActionType.ERROR,
]);
test('all client intiated messages have handler', () => {
    const allHandlerKeys = Array.from(clientHandlerRegister.messageList);
    for (const systemActionType of Object.values(priselpb.SystemActionType)) {
        if (typeof systemActionType === 'string') {
            return;
        }
        if (systemActionsWithoutHandler.has(systemActionType)) {
            continue;
        }
        expect(allHandlerKeys).toContain(priselpb.SystemActionType[systemActionType]);
    }
});
