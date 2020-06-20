import { Coordinate, PropertyInfo, GamePlayerInfo } from './types';

export interface AnimationArgs {
    unspecified: void;
    game_start: void;
    dice_roll: {
        player: GamePlayerInfo;
    };
    dice_down: {
        steps: number;
    };
    move: {
        start: Coordinate;
        path: Coordinate[];
    };
    focus_land: {
        property: PropertyInfo;
    };
    invested: {
        property: PropertyInfo;
    };
    pan: {
        target: Coordinate;
    };
    turn_start: {
        player: GamePlayerInfo;
    };
    pay_rent: {
        payer: GamePlayerInfo;
        receiver: GamePlayerInfo;
    };
}

export type AnimationName = keyof AnimationArgs;

// utilities to work with animations
export const animationMap: Record<AnimationName, number> = {
    unspecified: 0,
    game_start: 1000,
    dice_roll: 1000,
    dice_down: 300,
    move: 500, // per tile
    focus_land: 100,
    invested: 1000,
    pan: 100, // per tile
    turn_start: 200,
    pay_rent: 1000,
};
