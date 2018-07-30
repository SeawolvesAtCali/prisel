// @flow
import type { ClientT } from './client';
import type { RoomT } from './room';

export type StateManagerT = {|
    connections: {| controllers: { [id: string]: ClientT }, displays: { [id: string]: ClientT } |},
    messages: Array<string>,
    rooms: { [room_id: string]: RoomT },
|};
