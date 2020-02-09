// import createContext from '../../createContext';
// import { handleLeave } from '../handleLeave';
// import * as StateUtils from '../../utils/stateUtils';
// import { mockClient, mockSocket } from '../../utils/testUtils';
// import { ClientId } from '../../objects/client';
// import createHandle, { Handle } from '../../utils/handle';

// jest.mock('../../utils/handle');

// describe('handleLeave', () => {
//     it('should call room config onLeave', () => {
//         const onLeave = jest.fn();
//         const client = mockClient({ id: '123' });
//         const socket = mockSocket();
//         const mockContext = createContext({});
//         const mockHandle = createHandle({
//             context: mockContext,
//             roomId: '123',
//             gameConfig: {},
//             roomConfig: {
//                 onLeave,
//             },
//         });
//         const mockData = {};
//         jest.spyOn(StateUtils, 'getClient').mockReturnValue(client);
//         jest.spyOn(StateUtils, 'getHandle').mockReturnValue(mockHandle);
//         handleLeave(mockContext, socket)(mockData);
//         expect(onLeave).toHaveBeenCalledWith(mockHandle, client.id, mockData);
//     });
// });
