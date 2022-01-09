/**
 * Utility functions for Id
 */

const idCounts: { [type: string]: number } = {};

export function newId<T>(type: string, forceId?: string): T {
    if (forceId) {
        return `${type}-${forceId}` as unknown as T;
    }
    if (!idCounts[type]) {
        idCounts[type] = 1;
    } else {
        idCounts[type]++;
    }
    return `${type}-${idCounts[type]}` as unknown as T;
}

export type RoomId = string;
export type ClientId = string;
export type RequestId = string;

export function newRoomId(): RoomId {
    return newId('ROOM');
}

export function newClientId(): ClientId {
    return newId('CLIENT');
}

export function newRequestId(): RequestId {
    return newId('REQUEST');
}
