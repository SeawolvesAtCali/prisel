import createStateManager from './stateManager';
import SocketManager from './socketManager';
import produce from 'immer';
import { Context } from './objects';

const createContext = (partial: Partial<Context> = {}): Context => {
    const context: Partial<Context> = {
        StateManager: createStateManager(),
        SocketManager: new SocketManager(),
        server: null,
        ...partial,
        updateState: (updater) => {
            context.StateManager = produce(context.StateManager, (draftState) =>
                updater(draftState, context.StateManager),
            );
            return context.StateManager;
        },
    };

    return context as Context;
};

export default createContext;
