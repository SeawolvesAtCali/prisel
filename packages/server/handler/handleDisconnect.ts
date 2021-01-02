import { Packet } from '@prisel/common';
import { system_action_type } from '@prisel/protos';
import { Context, Socket } from '../objects';
import { handleExit } from './handleExit';

/**
 * Handles client disconnection when client disconnects unexpectedly
 * This is called by server directly without client sending a request
 * @param context
 * @param socket
 */
export const handleDisconnect = (context: Context, socket: Socket) => {
    handleExit(
        context,
        socket,
    )(Packet.forSystemAction(system_action_type.SystemActionType.EXIT).build());
};
