import { ChanceDisplay, Coordinate, GamePlayerInfo, PropertyInfo } from './types';

export enum EmotionType {
    UNSPECIFIED,
    CHEER,
    ANGRY,
}
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
    // a general purpose animation to play to show player's emotion
    player_emotion: {
        player: GamePlayerInfo;
        emotion: EmotionType;
    };
    // When player arrive at the tile with chance chest, a card flyout from the
    // chance chest to the center of the screen. The current player would need
    // to click on anywhere to dismiss it after reading card. Other clients will
    // play the same animation except they won't be able to dismiss the card.
    // The card will be automatically dismissed when the current player dismiss it.
    open_chance_chest: {
        chance_chest_tile: Coordinate;
        chance: ChanceDisplay;
    };
    // Dismiss the chance card. When current player click on anywhere to dismiss
    // the card, this animation is broadcasted.
    dismiss_chance_card: void;
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
    player_emotion: 1000,
    // the time it takes for the card to fly out of the chest to the center of screen
    open_chance_chest: 1000,
    dismiss_chance_card: 0,
};
