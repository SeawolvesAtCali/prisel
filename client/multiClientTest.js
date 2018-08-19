const debug = require('debug')('debug');
const Client = require('./client');
const constants = require('../common/constants');
const { getJoin, getCreateRoom } = require('./message/room');

const { CONTROLLER_NS: CONTROLLER } = constants;
const firstClient = new Client(CONTROLLER);
const secondClient = new Client(CONTROLLER);

firstClient.connect();
secondClient.connect();

firstClient.on(CONTROLLER, 'CREATE_ROOM_ACCEPT', (state, emit) => (data) => {
    debug('create room got accepted', data);
    secondClient.on(CONTROLLER, 'JOIN_ACCEPT', () => () => {
        debug('second client join accepted');
    });
    secondClient.on(CONTROLLER, 'JOIN_ERROR', () => (joinError) => {
        debug('second client join failed', joinError);
    });
    secondClient.emit(CONTROLLER, ...getJoin(data.roomId));
    return {
        ...state,
        roomId: data.roomId,
    };
});

firstClient.emit(CONTROLLER, ...getCreateRoom('happyRoom'));
