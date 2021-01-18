import { system_action_type } from '@prisel/protos';
import clientHandlerRegister from '../../clientHandlerRegister';
import '../index';

const systemActionsWithoutHandler = new Set([
    system_action_type.SystemActionType.UNSPECIFIED,
    system_action_type.SystemActionType.WELCOME,
    system_action_type.SystemActionType.BROADCAST,
    system_action_type.SystemActionType.ROOM_STATE_CHANGE,
    system_action_type.SystemActionType.ANNOUNCE_GAME_START,
    system_action_type.SystemActionType.ERROR,
]);
test('all client intiated messages have handler', () => {
    const allHandlerKeys = Array.from(clientHandlerRegister.messageList);
    for (const systemActionType of Object.values(system_action_type.SystemActionType)) {
        if (typeof systemActionType === 'string') {
            return;
        }
        if (systemActionsWithoutHandler.has(systemActionType)) {
            continue;
        }
        expect(allHandlerKeys).toContain(system_action_type.SystemActionType[systemActionType]);
    }
});
