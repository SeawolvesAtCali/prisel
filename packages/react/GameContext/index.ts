import { createContext } from 'react';

export interface RoomInfo {
    id: string;
    name: string;
    host: string;
    players: string[];
    clientMap: any;
}

interface GameContext {
    roomId?: string;
    roomInfo?: RoomInfo;
    gameType?: string;
    roomType?: string;
    setRoomId?: (roomId: GameContext['roomId']) => void;
}

const context = createContext<GameContext>({});
export default context;
