import React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import Login from '../Login';
import Lobby from '../Lobby';
import Room from '../Room';

storiesOf('pages', module)
    .add('login', () => <Login onLogin={action('login')} />)
    .add('Lobby', () => <Lobby onJoin={action('join')} />)
    .add('Room', () => <Room onReady={action('ready')} onStart={action('start')} />);
