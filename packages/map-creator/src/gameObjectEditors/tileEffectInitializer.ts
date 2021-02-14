import {
    MoneyExchangeDirection,
    MoneyExchangeType,
    TileEffectInput,
    TileEffectInputArgs,
} from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';

export function tileEffectInitializer<T extends keyof TileEffectInputArgs>(
    type: T,
): TileEffectInput<any> | undefined {
    switch (type) {
        case 'move_to_tile':
            const moveToTile: TileEffectInput<'move_to_tile'> = {
                display: {
                    title: 'move to tile',
                    description: 'Move to a tile immediately',
                },
                type: 'move_to_tile',
                timing: monopolypb.TileEffect_Timing.ENTERING,
                inputArgs: {
                    tileId: '',
                    isTeleport: false,
                },
            };
            return moveToTile;
        case 'move_steps':
            const moveSteps: TileEffectInput<'move_steps'> = {
                display: {
                    title: 'move steps',
                    description: 'Move steps',
                },
                type: 'move_steps',
                timing: monopolypb.TileEffect_Timing.STOPPING,
                inputArgs: {
                    steps: 1,
                },
            };
            return moveSteps;
        case 'money_exchange':
            const cashExchange: TileEffectInput<'money_exchange'> = {
                display: {
                    title: 'cash exchange',
                    description: 'give or take cash',
                },
                type: 'money_exchange',
                timing: monopolypb.TileEffect_Timing.LEAVING,
                inputArgs: {
                    direction: MoneyExchangeDirection.FROM_BANK,
                    type: MoneyExchangeType.DEFAULT,
                    amount: 0,
                },
            };
            return cashExchange;
        case 'collectible':
            const collectable: TileEffectInput<'collectible'> = {
                display: {
                    title: 'collectible',
                    description: "add something to player's possession",
                },
                type: 'collectible',
                timing: monopolypb.TileEffect_Timing.ENTERING,
                inputArgs: {
                    type: monopolypb.CollectibleExtra_CollectibleType.GET_OUT_OF_JAIL_FREE,
                },
            };
            return collectable;
        case 'detained':
            const detained: TileEffectInput<'detained'> = {
                display: {
                    title: 'detained',
                    description: 'stay at current tile for some turns and no action can be perform',
                },
                type: 'detained',
                timing: monopolypb.TileEffect_Timing.STOPPING,
                inputArgs: {
                    type: monopolypb.DetainedExtra_Type.ARRESTED,
                    length: 3,
                },
            };
            return detained;
    }
}
