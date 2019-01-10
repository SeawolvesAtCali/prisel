export function createPacket(messageType: string, payload: any) {
    return JSON.stringify({
        type: messageType,
        payload,
    });
}

export function parsePacket(packet: string) {
    return JSON.parse(packet);
}
