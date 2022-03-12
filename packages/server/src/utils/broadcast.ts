import { Packet } from '@prisel/common';
import { Player } from '../player';
import { emit } from './networkUtils';

export function broadcast(
    players: Player[],
    packetBuilder: ((player: Player) => Packet | undefined) | Packet,
) {
    if (typeof packetBuilder === 'function') {
        const packets = players.map(packetBuilder);
        setImmediate(() => {
            for (let i = 0; i < players.length; i++) {
                const currentPacket = packets[i];
                if (currentPacket) {
                    emit(players[i].getSocket(), currentPacket);
                }
            }
        });
        return;
    }
    const packet = packetBuilder;
    if (packet) {
        setImmediate(() => {
            for (const player of players) {
                emit(player.getSocket(), packetBuilder);
            }
        });
    }
}
