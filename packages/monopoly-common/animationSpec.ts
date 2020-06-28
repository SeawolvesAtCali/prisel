import { Coordinate, PropertyInfo, GamePlayerInfo } from './types';

// Define types of animations

export interface AnimationArgs {
    unspecified: void;
    // animation play on game start
    game_start: void;
    // dice roll animation
    dice_roll: {
        player: GamePlayerInfo;
    };
    // dice drop and review final number
    dice_down: {
        steps: number;
        player: GamePlayerInfo;
    };
    // player move along tile path
    move: {
        player: GamePlayerInfo;
        start: Coordinate;
        path: Coordinate[];
    };
    // highlight the property for purchase
    focus_land: {
        property: PropertyInfo;
    };
    // show animation for purchase/update
    invested: {
        property: PropertyInfo;
    };
    // pan camera to next player
    pan: {
        target: Coordinate;
    };
    // current player play ready to start animation
    turn_start: {
        player: GamePlayerInfo;
    };
    // player pay rent
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
    dice_down: 1000,
    move: 500, // per tile
    focus_land: 100,
    invested: 1000,
    pan: 100, // per tile
    turn_start: 200,
    pay_rent: 1000,
};
