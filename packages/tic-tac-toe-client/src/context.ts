import { priselpb, tic_tac_toepb } from '@prisel/protos';
import React from 'react';

const Context = React.createContext<{
    id?: string;
    roomId?: string;
    roomName?: string;
    players: priselpb.PlayerInfo[];
    host?: string;
    gameState?: tic_tac_toepb.GameStatePayload;
}>({
    id: undefined,
    roomId: undefined,
    roomName: undefined,
    players: [],
    host: undefined,
    gameState: undefined,
});

export default Context;
