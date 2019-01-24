import * as React from 'react';

import { Button } from 'antd';
import { ClientContextConsumer, addToLog } from './ClientContainer';
import Client from '../client';
import { getGameStart } from '../message';

const handleStart = (client: Client, log: addToLog) => () => {
    const [messageType, payload] = getGameStart();
    client.emit(messageType, payload);
    log(messageType, payload, 'client');
};
const GameStartButton = ({}) => (
    <ClientContextConsumer>
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
    </ClientContextConsumer>
);

export default GameStartButton;
