import { Handle, HandleProps } from '../abstractHandle';
import { ClientId } from '../../objects';

export class MockHandle extends Handle {
    public emit(playerId: ClientId, ...rest: any[]) {
        // Do nothing;
    }
    public broadcast(playerIds: ClientId[], ...rest: any[]) {
        // Do nothing;
    }
    public broadcastRoomUpdate(): void {
        // Do nothing;
    }
}

function createHandle(props: HandleProps) {
    return new MockHandle(props);
}

export { Handle };
export default createHandle;
