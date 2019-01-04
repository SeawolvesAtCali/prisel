import React from 'react';

const Context = React.createContext({
    userId: '123',
    roomState: {
        id: 'id',
        name: 'room name',
        host: '123',
        guests: [],
        gameState: {},
        clients: [
            {
                username: 'jack',
                id: '123',
                isReady: false,
                roomId: '345',
            },
        ],
    },
});

export default Context;
