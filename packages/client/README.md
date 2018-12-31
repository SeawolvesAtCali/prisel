# client

> prisel client library

Client provides utilities to communicate with server. The goal of client is to be as simple as
possible so that it's feasible to develop our game without it.

## Usage

```bash
> npm i @prisel/client
```

```javascript
import { Client, Messages, MessageType } from '@prisel/client';

const client = new Client('ws://localhost:3000');

(async function() {
    await client.connect();
    const { userId } = await client.login('my-username'));
    client.emit(...Messages.getCreateRoom('room-name'));
    await client.once(MessageType.SUCCESS);
    console.log('we are in a room');
})();
```

This project is still in early stage. We are working on the API.

## Contributing guide

To develop client, we can use the demo page. To start the demo page, run

```bash
> npm run start:client
```

in the project root directory.
![client-demo-page](https://user-images.githubusercontent.com/5957726/50565878-4d47ae00-0ce8-11e9-91e3-31d49fefeaf2.png)
