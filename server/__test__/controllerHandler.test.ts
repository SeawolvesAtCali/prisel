import * as handler from '../controllerHandler';
import * as roomMessages from '../message/room';
import SocketIO from 'socket.io';
import createContext from '../createContext';
import { Context } from '../objects';
import { emit } from '../networkUtils';

jest.mock('../networkUtils');

describe('controllerHandler', () => {
    describe('handleLogin', () => {
        let mockContext: Context;
        beforeEach(() => {
            mockContext = createContext({});
        });

        it('should save the connection in StateManager', () => {
            const mockClient = {} as SocketIO.Socket;
            handler.handleLogin(mockContext, mockClient)({ username: 'Batman' });
            expect(
                Object.values(mockContext.StateManager.connections.controllers).find(
                    (controller) => controller.username === 'Batman',
                ),
            ).toEqual(expect.any(Object));
        });

        it('should save the connection in SocketMap', () => {
            const mockClient = {} as SocketIO.Socket;
            jest.spyOn(mockContext.SocketManager, 'add').mockImplementation();
            handler.handleLogin(mockContext, mockClient)({ username: 'Batman' });
            expect(mockContext.SocketManager.add).toHaveBeenCalledWith(
                expect.any(String),
                mockClient,
            );
        });

        it('should emit login accept message back to client', () => {
            const mockClient = {} as SocketIO.Socket;
            handler.handleLogin(mockContext, mockClient)({ username: 'Batman' });
            expect(emit).toHaveBeenCalledWith(
                mockClient,
                ...roomMessages.getLoginSuccess(expect.any(String)),
            );
        });
    });
});
