// import { mockSocket, mockContext, mockRoomConfig, mockGameConfig } from '../../utils/testUtils';
// import { GAME_PHASE } from '../../objects/gamePhase';
// import { handleJoin } from '../handleJoin';
// import createHandle, { Handle } from '../../utils/handle';

// jest.mock('../../utils/handle');
// jest.mock('../../utils/networkUtils');

// describe('handleJoin', () => {
//     it('should add user to the room', () => {
//         const mockGuest = mockSocket();
//         const mockRoomId = 'room_1';
//         const roomConfig = mockRoomConfig({
//             onJoin: jest.fn(),
//         });
//         const context = mockContext(
//             {
//                 StateManager: {
//                     connections: {
//                         host1: { id: 'host1', username: 'hostA', roomId: 'room_1' },
//                         guest1: { id: 'guest1', username: 'guestA' },
//                     },
//                     messages: [],
//                     rooms: {
//                         [mockRoomId]: {
//                             id: mockRoomId,
//                             name: 'bathroom',
//                             host: 'host1',
//                             players: ['host1'],
//                             gamePhase: GAME_PHASE.WAITING,
//                         },
//                     },
//                 },
//             },
//             undefined,
//             roomConfig,
//         );
//         context.handles[mockRoomId] = createHandle({
//             context,
//             roomId: mockRoomId,
//             roomConfig,
//             gameConfig: mockGameConfig(),
//         });

//         context.SocketManager.add('guest1', mockGuest);
//         const data = { roomId: mockRoomId };
//         handleJoin(context, mockGuest)(data);
//         expect(roomConfig.onJoin).toHaveBeenCalledWith(expect.any(Handle), 'guest1', data);
//     });
//     it('should not join another room if client is already in one room', () => {
//         const mockHost = mockSocket();
//         const mockGuest = mockSocket();
//         const mockRoomId = 'room_1';
//         const mockOtherRoomId = 'room_2';
//         const context = mockContext({
//             StateManager: {
//                 connections: {
//                     host1: { id: 'host1', username: 'hostA', roomId: mockRoomId },
//                     guest1: { id: 'guest1', username: 'guestA', roomId: mockRoomId },
//                 },
//                 messages: [],
//                 rooms: {
//                     [mockRoomId]: {
//                         id: mockRoomId,
//                         name: 'bathroom',
//                         host: 'host1',
//                         players: ['host1', 'guest1'],
//                         gamePhase: GAME_PHASE.WAITING,
//                     },
//                     [mockOtherRoomId]: {
//                         id: mockOtherRoomId,
//                         name: 'kitchen',
//                         host: 'anotherhost',
//                         players: ['anotherhost'],
//                         gamePhase: GAME_PHASE.WAITING,
//                     },
//                 },
//             },
//         });
//         const roomConfig = mockRoomConfig({
//             onJoin: jest.fn(),
//         });
//         context.handles[mockRoomId] = createHandle({
//             context,
//             roomId: mockRoomId,
//             gameConfig: mockGameConfig(),
//             roomConfig,
//         });
//         const { SocketManager } = context;
//         SocketManager.add('host1', mockHost);
//         SocketManager.add('guest1', mockGuest);

//         handleJoin(context, mockHost)({ roomId: mockOtherRoomId });
//         handleJoin(context, mockGuest)({ roomId: mockOtherRoomId });
//         expect(roomConfig.onJoin).not.toHaveBeenCalled();
//     });
// });
