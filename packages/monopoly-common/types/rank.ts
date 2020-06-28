import { PlayerInfo } from '@prisel/common';

export interface Rank {
    player: PlayerInfo;
    character: number;
    assets: {
        cash: number;
        property: number;
        total: number;
    };
}
