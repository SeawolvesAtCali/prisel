import React from 'react';

const Context = React.createContext({
    id: undefined,
    roomId: undefined,
    roomName: undefined,
    players: [],
    host: undefined,
    gameState: undefined,
});

export default Context;
