import * as React from 'react';

import { Button } from 'antd';
import { ClientContextConsumer } from './ClientContainer';
import Client from '../client';
import { getGameStart } from '../message';

const handleStart = (client: Client) => () => {
    client.emit(...getGameStart());
};
const GameStartButton = ({}) => (
    <ClientContextConsumer>
        {({ client }) => (
            <Button
                onClick={handleStart(client)}
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
