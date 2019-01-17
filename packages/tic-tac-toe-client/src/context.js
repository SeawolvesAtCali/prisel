import React from 'react';

const Context = React.createContext({
    userId: '123',
    roomState: {
        id: 'id',
        name: 'room name',
        host: '123',
        gameState: {},
        players: [
            {
                username: 'jack',
                id: '123',
                roomId: '345',
            },
        ],
    },
});

export default Context;
