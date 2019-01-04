import createContext from '../createContext';

describe('createContext', () => {
    describe('updateState', () => {
        it('should not modify state referece if no change', () => {
            const mockContext = createContext();
            const originalState = mockContext.StateManager;
            mockContext.updateState(() => {});
            expect(mockContext.StateManager).toBe(originalState);
        });

        it('should get a new reference if state is changed', () => {
            const mockContext = createContext();
            const originalState = mockContext.StateManager;
            mockContext.updateState((draft) => {
                draft.messages.push('a');
            });
            expect(mockContext.StateManager).not.toBe(originalState);
        });
    });
});
