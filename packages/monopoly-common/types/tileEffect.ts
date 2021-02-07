import { monopolypb } from '@prisel/protos';
import { MoneyExchangeDirection, MoneyExchangeType } from '../moneyExchange';

export interface TileEffectInputArgs {
    unspecified: {};
    move_to_tile: {
        tileId: string;
        isTeleport: boolean;
        // teleport immediately bring the user to the target tile as if the two
        // tiles are connected. When entering the target tile, the Entering,
        // Stopping effect of the target tile will trigger.
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
    detained: {
        type: monopolypb.DetainedExtra_Type;
        length: number;
    };
}

export interface TileEffectInput<T extends keyof TileEffectInputArgs = 'unspecified'> {
    display: monopolypb.TileEffectDisplay;
    type: T;
    timing: monopolypb.TileEffect_Timing;
    inputArgs: TileEffectInputArgs[T];
}

// example effects combinations:

// Passing GO get 200
const passingGoGet200: TileEffectInput<'money_exchange'> = {
    display: {
        title: 'Passing GO',
        description: 'Collect 200',
    },
    type: 'money_exchange',
    timing: monopolypb.TileEffect_Timing.ENTERING,
    inputArgs: {
        direction: MoneyExchangeDirection.FROM_BANK,
        type: MoneyExchangeType.DEFAULT,
        amount: 200,
    },
};

// Stopping at Go To Jail
const goToJail: TileEffectInput<'move_to_tile'> = {
    display: {
        title: 'Go To Jail',
        description: 'Go to jail immediately, do not pass GO',
    },
    type: 'move_to_tile',
    timing: monopolypb.TileEffect_Timing.STOPPING,
    inputArgs: {
        tileId: 'jail tile id',
        isTeleport: true,
    },
};

// Jail tile
// when stopping at this this tile (through teleport),
const DetainedAtJail: TileEffectInput<'detained'> = {
    display: {
        title: 'Stay at Jail',
        description: 'Stay at Jail for 3 days',
    },
    type: 'detained',
    timing: monopolypb.TileEffect_Timing.STOPPING,
    inputArgs: {
        type: monopolypb.DetainedExtra_Type.ARRESTED,
        length: 3,
    },
};

// connected tiles (through teleport)
const Teleport: TileEffectInput<'move_to_tile'> = {
    display: {
        title: 'Teleport',
        description: 'Move to target tile immediately',
    },
    type: 'move_to_tile',
    timing: monopolypb.TileEffect_Timing.ENTERING,
    inputArgs: {
        tileId: 'target tile id',
        isTeleport: true,
    },
};
