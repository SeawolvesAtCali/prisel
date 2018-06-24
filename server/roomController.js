const debug = require('debug')('debug');
const networkUtils = require('./networkUtils');
const roomMessages = require('./message/room');
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
    networkUtils.emit(client, ...roomMessages.getCreateRoomAccept(roomId));
};

function handleRoomActions(context, client) {
    client.on('CREATE_ROOM', handleCreateRoom(context, client));
}

module.exports = {
    handleCreateRoom,
    handleRoomActions,
};
