const debug = require('debug')('debug');
const { newId } = require('./idUtils');

const handleCreateRoom = (context, client) => (data = {}) => {
    const { roomName } = data;
    const { SocketManager, StateManager } = context;
    const hostId = SocketManager.getId(client);
    const roomId = newId('ROOM');
    const room = {
        id: roomId,
        name: roomName,
        host: hostId,
        guests: [],
        displays: [],
    };

    StateManager.rooms[roomId] = room;
    client.join(roomId);
    debug(`roomController: ${hostId} created room ${roomName} ${roomId}`);
    // TODO: emit JOIN_ACCEPT to client
};

function handleRoomActions(context, client) {
    client.on('CREATE_ROOM', handleCreateRoom(context, client));
}

module.exports = {
    handleCreateRoom,
    handleRoomActions,
};
