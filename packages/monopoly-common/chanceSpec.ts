import { chance } from '@prisel/protos';

export enum MoneyExchangeDirection {
    UNSPECIFIED,
    TO_ALL_OTHER_PLAYERS,
    FROM_ALL_OTHER_PLAYERS,
    FROM_BANK,
    TO_BANK,
}

export enum MonyExchangeType {
    UNSPECIFIED, // the default, plain fixed amount exchange
    OWN_PROPERTY_PER_HUNDRED, // based on total worth of owned properties. For every hundred of worth, pay the amount.
}

export interface ChanceInputArgs {
    unspecified: {};
    move_to_tile: {
        tileId: string;
        isTeleport: boolean;
    };
    money_exchange: {
        direction: MoneyExchangeDirection;
        type: MonyExchangeType;
        amount: number;
    };
    move_steps: {
        steps: number;
    };
    collectable: {
        type: chance.CollectibleExtra_CollectibleType;
    };
}
