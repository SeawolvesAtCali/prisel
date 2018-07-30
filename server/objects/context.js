// @flow

import type { StateManagerT } from './stateManager';
import type SocketManager from '../socketManager';
import type { SocketT } from './socket';

export type ContextT = {| SocketManager: SocketManager, StateManager: StateManagerT, io: SocketT |};
