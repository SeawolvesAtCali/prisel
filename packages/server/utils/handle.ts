// import { Context } from '../objects';
// import { emit } from './networkUtils';
// import { PlayerId } from '../objects/client';
// import { RoomId } from '../objects/room';
// import { Packet } from '@prisel/common';
// import { GameConfig } from './gameConfig';
// import { RoomConfig } from './roomConfig';
// import { updateClientWithRoomData } from './updateUtils';

// import { Handle, HandleProps } from './abstractHandle';

// const initialRequestId = 0;

// /**
//  * handle provides utilities to update room and game state
//  * as well as performing network calls.
//  */
// // tslint:disable-next-line:max-classes-per-file
// class HandleImpl extends Handle {
//     public roomId: RoomId;
//     public game: GameConfig;
//     public room: RoomConfig;

//     protected context: Context;

//     private requestIds: Map<PlayerId, any> = new Map();

//     constructor({ context, roomId, gameConfig, roomConfig }: HandleProps) {
//         super({ context, roomId, gameConfig, roomConfig });
//     }

//     public newRequestId(playerId: PlayerId) {
//         const requestId = this.requestIds.has(playerId)
//             ? createRequestId(this.requestIds.get(playerId))
//             : initialRequestId;
//         this.requestIds.set(playerId, requestId);
//         return `${requestId}`;
//     }

//     public emit(playerId: PlayerId, packet: Packet<any>) {
//         const { SocketManager } = this.context;
//         const clientSocket = SocketManager.getSocket(playerId);
//         if (clientSocket) {
//             emit(clientSocket, packet);
//         }
//     }

//     public broadcast(playerIds: PlayerId[], packetBuilder: (player: PlayerId) => Packet<any>) {
//         for (const playerId of playerIds) {
//             this.emit(playerId, packetBuilder(playerId));
//         }
//     }

//     public broadcastRoomUpdate() {
//         updateClientWithRoomData(this.context, this.roomId);
//     }
// }

// function createRequestId(previousRequestId: any) {
//     return previousRequestId + 1;
// }

// function createHandle(props: HandleProps): Handle {
//     return new HandleImpl(props);
// }

// export { Handle, HandleProps };
// export default createHandle;
