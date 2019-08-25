import { GameConfig, BaseGameConfig } from './gameConfig';
import { RoomConfig, BaseRoomConfig } from './roomConfig';

class ConfigManager {
    private gameConfigs = new Map<GameConfig['type'], GameConfig>();
    private roomConfigs = new Map<RoomConfig['type'], RoomConfig>();

    public add(gameConfig: GameConfig, roomConfig: RoomConfig) {
        this.addGame(gameConfig);
        this.addRoom(roomConfig);
    }

    public addGame(gameConfig: GameConfig) {
        this.gameConfigs.set(gameConfig.type, gameConfig);
    }

    public addRoom(roomConfig: RoomConfig) {
        this.roomConfigs.set(roomConfig.type, roomConfig);
    }

    public get(
        gameType: string = BaseGameConfig.type,
        roomType: string = BaseRoomConfig.type,
    ): { gameConfig: GameConfig; roomConfig: RoomConfig } {
        const gameConfig = this.gameConfigs.get(gameType);
        const roomConfig = this.roomConfigs.get(roomType);

        if (roomConfig.supportGame(gameConfig)) {
            return {
                gameConfig,
                roomConfig,
            };
        }
    }

    public getAllTypes(): {
        gameTypes: Array<GameConfig['type']>;
        roomTypes: Array<RoomConfig['type']>;
    } {
        const gameConfigs = Array.from(this.gameConfigs.keys());
        const roomConfigs = Array.from(this.roomConfigs.keys());
        return {
            gameTypes: gameConfigs.length > 0 ? gameConfigs : [BaseGameConfig.type],
            roomTypes: roomConfigs.length > 0 ? roomConfigs : [BaseRoomConfig.type],
        };
    }
}

export default ConfigManager;
