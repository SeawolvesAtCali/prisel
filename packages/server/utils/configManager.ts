import { GameConfig, BaseGameConfig } from './gameConfig';
import { RoomConfig, BaseRoomConfig } from './roomConfig';

class ConfigManager {
    private gameConfigs: { [gameType: string]: GameConfig } = {
        [BaseGameConfig.type]: BaseGameConfig,
    };
    private roomConfigs: { [roomType: string]: RoomConfig } = {
        [BaseRoomConfig.type]: BaseRoomConfig,
    };
    private gameRoomPair: { [gameType: string]: Set<string> } = {
        [BaseGameConfig.type]: new Set([BaseRoomConfig.type]),
    };

    public add(gameConfig: GameConfig, roomConfig: RoomConfig) {
        this.gameConfigs[gameConfig.type] = gameConfig;
        this.roomConfigs[roomConfig.type] = roomConfig;
        const allRoomTypesForGame = this.gameRoomPair[gameConfig.type] || new Set<string>();
        allRoomTypesForGame.add(roomConfig.type);
        this.gameRoomPair[gameConfig.type] = allRoomTypesForGame;
    }

    public get(
        gameType: string = BaseGameConfig.type,
        roomType: string = BaseRoomConfig.type,
    ): { gameConfig: GameConfig; roomConfig: RoomConfig } {
        const allRoomTypesForGame = this.gameRoomPair[gameType] || new Set<string>();
        if (allRoomTypesForGame && allRoomTypesForGame.has(roomType)) {
            return {
                gameConfig: this.gameConfigs[gameType],
                roomConfig: this.roomConfigs[roomType],
            };
        }
    }

    public getAllTypes() {
        return {
            gameTypes: Object.keys(this.gameConfigs),
            roomTypes: Object.keys(this.roomConfigs),
        };
    }
}

export default ConfigManager;
