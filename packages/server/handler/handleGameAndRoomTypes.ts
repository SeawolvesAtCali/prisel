import clientHandlerRegister from '../clientHandlerRegister';
import { Context, Socket } from '../objects';
import { emit } from '../utils/networkUtils';
import { getGameAndRoomTypesSuccess } from '../message';
import { MessageType } from '@prisel/common';

export const handleGetGameAndRoomTypes = (context: Context, socket: Socket) => (data: {}) => {
    const { gameTypes, roomTypes } = context.configManager.getAllTypes();
    emit(socket, ...getGameAndRoomTypesSuccess(gameTypes, roomTypes));
};

clientHandlerRegister.push(MessageType.GET_GAME_AND_ROOM_TYPES, handleGetGameAndRoomTypes);
