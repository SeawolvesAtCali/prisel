export const TILE_SIZE = 100;
export const MOVING_DURATION_PER_TILE = 0.5;

export const CHARACTER_COLORS = {
    0: 'green',
    1: 'blue',
    2: 'beige',
    3: 'pink',
    4: 'yellow',
};

// if the horizontal distance is more than FLIP_THRESHOLD when moving, consider
// flipping the node.
export const FLIP_THRESHHOLD = 10;

export const SELECTOR_ZINDEX = 1000;

export const AUTO_PANNING_PX_PER_SECOND = 1000;

// name of the node used for event emitting
export const EVENT_BUS = 'Canvas/eventBus';

export enum EVENT {
    DICE_ROLLED = 'dice_rolled',
    DICE_ROLLED_RESPONSE = 'dice_rolled_response', // arg1 = value
    // roll dice animation finished, player can start moving.
    DICE_ROLLED_END = 'dice_rolled_end',

    START_CURRENT_PLAYER_TURN = 'start_current_player_turn',
    END_CURRENT_PLAYER_TURN = 'end_current_player_turn',
}
