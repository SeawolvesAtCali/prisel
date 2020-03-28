import '../index';
import clientHandlerRegister from '../../clientHandlerRegister';
import { MessageType, serverInitiatedMessages } from '@prisel/common/messageTypes';
import { messageTypeMap } from '@prisel/common';

test('all client intiated messages have handler', () => {
    const allHandlerKeys = Array.from(clientHandlerRegister.messageList).map((key) =>
        messageTypeMap.get(key),
    );
    for (const messageType of Object.values(MessageType)) {
        if (
            messageType === MessageType.UNSPECIFIED ||
            // number enum has mapping from key to value and value to key https://github.com/Microsoft/TypeScript/issues/17198#issuecomment-315400819
            typeof messageType === 'string' ||
            serverInitiatedMessages.includes(messageType)
        ) {
            continue;
        }
        expect(allHandlerKeys).toContain(messageTypeMap.get(messageType));
    }
});
