import * as React from 'react';

import { Button } from 'antd';
import ClientContainer, { addToLog } from './ClientContainer';
import { Messages, Client } from '@prisel/client';

const handleStart = (client: Client, log: addToLog) => () => {
    const [messageType, payload] = Messages.getGameStart();
    client.emit(messageType, payload);
    log(messageType, payload, 'client');
};
const GameStartButton = () => (
    <ClientContainer.ClientContextConsumer>
        {({ client, log }) => (
            <Button
                onClick={handleStart(client, log)}
                type="primary"
                block
                style={{ marginBottom: '10px' }}
            >
                Start Game
            </Button>
        )}
    </ClientContainer.ClientContextConsumer>
);

export default GameStartButton;
