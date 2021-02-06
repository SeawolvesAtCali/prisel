import { monopolypb } from '@prisel/protos';
import { MoneyExchangeDirection, MoneyExchangeType } from '../moneyExchange';

export interface TileEffectInputArgs {
    unspecified: {};
    move_to_tile: {
        tileId: string;
        // for tile effect, it is strange if player is already walking and we
        // ask them to continue walking. We will always use teleport.
    };
    money_exchange: {
        direction: MoneyExchangeDirection;
        type: MoneyExchangeType;
        amount: number;
    };
    move_steps: {
        steps: number;
    };
    collectible: {
        type: monopolypb.CollectibleExtra_CollectibleType;
    };
}

export interface TileEffectInput<T extends keyof TileEffectInputArgs = 'unspecified'> {
    display: monopolypb.TileEffectDisplay;
    type: T;
    timing: monopolypb.TileEffect_Timing;
    inputArgs: TileEffectInputArgs[T];
}
