import { Packet } from '@prisel/common';
import { Player } from '../player';
import { emit } from './networkUtils';

export function broadcast(players: Player[], packetBuilder: ((player: Player) => Packet) | Packet) {
    if (typeof packetBuilder === 'function') {
        const packets = players.map(packetBuilder);
        setImmediate(() => {
            for (let i = 0; i < players.length; i++) {
                if (packets[i]) {
                    emit(players[i].getSocket(), packets[i]);
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
