export default function createPacket(messageType: string, payload: object) {
    return JSON.stringify({
        type: messageType,
        payload,
    });
}

export function parsePacket(packet: string) {
    return JSON.parse(packet);
}
