import createHandle, { Handle } from '../handle';
import createContext from '../../createContext';
import { mockGameConfig, mockRoomConfig, mockClient, mockSocket } from '../testUtils';
import { emit } from '../networkUtils';
import SocketManager from '../../socketManager';
import { Socket } from '../../objects';
import { MessageType } from '@prisel/common';

jest.mock('../networkUtils');

describe('handle', () => {
    let handle: Handle;
    const playerId = '123';
    let socket: Socket;
    beforeEach(() => {
        const socketManager = new SocketManager();
        const context = createContext({
            SocketManager: socketManager,
        });
        socket = mockSocket();
        socketManager.add(playerId, socket);

        handle = createHandle({
            context,
            roomId: 'room123',
            gameConfig: mockGameConfig({}),
            roomConfig: mockRoomConfig({}),
        });
    });

    test('emit with two arguments should use MESSAGE type', () => {
        const data = {};
        handle.emit(playerId, data);
        expect(emit).toHaveBeenCalledWith(socket, MessageType.MESSAGE, data);
    });

    test('emit with three arguments should use the given type and payload', () => {
        const data = {};
        const messageType = MessageType.MOVE;
        handle.emit(playerId, messageType, data);
        expect(emit).toHaveBeenCalledWith(socket, messageType, data);
    });
});
