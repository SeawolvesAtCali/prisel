// import { handleCreateRoom } from '../handleCreateRoom';
// import { mockSocket, mockContext, mockRoomConfig } from '../../utils/testUtils';
// import { Handle } from '../../utils/handle';
// import find from 'lodash/find';
// import { GAME_PHASE } from '../../objects/gamePhase';
// jest.mock('../../utils/networkUtils');

// describe('handleCreateRoom', () => {
//     it('should create a room', () => {
//         const socket = mockSocket();
//         const mockUserId = 'user1';
//         const roomConfig = mockRoomConfig({
//             onCreate: jest.fn(),
//         });
//         const context = mockContext(
//             {
//                 StateManager: {
//                     connections: {
//                         [mockUserId]: { id: mockUserId, username: 'userA' },
//                     },
//                     messages: [],
//                     rooms: {},
//                 },
//             },
//             undefined,
//             roomConfig,
//         );
//         context.SocketManager.add(mockUserId, socket);
//         const mockRoomName = 'LivingRoom';
//         const data = { roomName: mockRoomName, gameType: 'game' };
//         handleCreateRoom(context, socket)(data);
//         expect(
//             find(context.StateManager.rooms, (room) => room.name === mockRoomName),
//         ).toBeDefined();
//         expect(roomConfig.onCreate).toHaveBeenCalledWith(expect.any(Handle), mockUserId, data);
//     });

//     it('should reject if user is already in a room', () => {
//         const host = mockSocket();
//         const guest = mockSocket();
//         const mockRoomId = 'bedroom';
//         const roomConfig = mockRoomConfig({
//             onCreate: jest.fn(),
//         });
//         const context = mockContext(
//             {
//                 StateManager: {
//                     connections: {
//                         host1: { id: 'host1', username: 'host', roomId: mockRoomId },
//                         guest1: { id: 'guest1', username: 'guest', roomId: mockRoomId },
//                     },
//                     messages: [],
//                     rooms: {
//                         [mockRoomId]: {
//                             id: mockRoomId,
//                             name: 'nice bedroom',
//                             host: 'host1',
//                             players: ['host1', 'guest1'],
//                             gamePhase: GAME_PHASE.WAITING,
//                         },
//                     },
//                 },
//             },
//             undefined,
//             roomConfig,
//         );
//         context.SocketManager.add('host1', host);
//         context.SocketManager.add('guest1', guest);
//         const originalState = context.StateManager;
//         handleCreateRoom(context, host)({ roomName: 'anotherRoom', gameType: 'tic' });
//         handleCreateRoom(context, guest)({ roomName: 'anotherRoom2', gameType: 'tic' });
//         expect(context.StateManager).toBe(originalState);
//         expect(roomConfig.onCreate).not.toHaveBeenCalled();
//     });
// });
