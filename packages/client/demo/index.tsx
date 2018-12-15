import * as roomMessages from '../message/room';
import Client from '../client';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Hello } from './main';
import 'antd/dist/antd.css';

// const client = new Client();

// (async () => {
//     await client.connect();
//     await client.login('batman');
//     const emitToServer = client.emit.bind(client);
// })();

ReactDOM.render(<Hello />, document.getElementById('app'));
