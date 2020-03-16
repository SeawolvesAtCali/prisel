import { emit } from './networkUtils';
import { Player } from '../player';
import { Packet } from '@prisel/common';

export function broadcast<Payload = any>(
    players: Player[],
    packetBuilder: ((player: Player) => Packet<Payload>) | Packet<Payload>,
) {
    if (typeof packetBuilder === 'function') {
        const packets = players.map(packetBuilder);
        setImmediate(() => {
            for (let i = 0; i < players.length; i++) {
                emit(players[i].getSocket(), packets[i]);
            }
        });
    } else {
        setImmediate(() => {
            for (const player of players) {
                emit(player.getSocket(), packetBuilder);
            }
        });
    }
}
