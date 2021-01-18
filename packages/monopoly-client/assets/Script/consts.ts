export const TILE_SIZE = 100;
// the landing position on a tile relative to the anchor of a tile.
// the anchor is at the bottom left corner of the tile.
// the landing is at the bottom center of the tile.
export const LANDING_POS_OFFSET = cc.v2(TILE_SIZE / 2, 0);
export const MOVING_DURATION_PER_TILE = 0.5;
export const TILE_CENTER_OFFSET = cc.v2(TILE_SIZE / 2, TILE_SIZE / 2);

export const CAMERA_FOLLOW_OFFSET = cc.v2(0, TILE_SIZE);

export const CHARACTER_COLORS = [
    // 0:
    'green',
    // 1:
    'blue',
    // 2:
    'beige',
    // 3:
    'pink',
    // 4:
    'yellow',
];

export const TILE_Z_INDEX_OFFSET = 0;
export const PROPERTY_Z_INDEX_OFFSET = 1;
export const PLAYER_Z_INDEX_OFFSET = 5;

export const CHARACTER_AVATAR_SPRITE_NAME = [
    // 0:
    'alienGreen_badge1',
    // 1:
    'alienBlue_badge1',
    // 2:
    'alienBeige_badge1',
    // 3:
    'alienPink_badge1',
    // 4:
    'alienYellow_badge1',
];

export function getCharacterColor(character: number) {
    return CHARACTER_COLORS[character % 5];
}

export function getCharacterAvatarSpriteName(character: number) {
    return CHARACTER_AVATAR_SPRITE_NAME[character % 5];
}

// if the horizontal distance is more than FLIP_THRESHOLD when moving, consider
// flipping the node.
export const FLIP_THRESHHOLD = 10;

export const SELECTOR_ZINDEX = 1000;

export const AUTO_PANNING_PX_PER_SECOND = 1000;

// name of the node used for event emitting
export const EVENT_BUS = 'Canvas';
export const GAME_CAMERA = 'Canvas/game camera';

export const PERSISTENT_NODE = 'Persistent';

export enum EVENT {
    DICE_ROLLED = 'dice_rolled',
    DICE_ROLLED_RESPONSE = 'dice_rolled_response', // arg1 = value
    // roll dice animation finished, player can start moving.
    DICE_ROLLED_END = 'dice_rolled_end',

    START_CURRENT_PLAYER_TURN = 'start_current_player_turn',
    END_CURRENT_PLAYER_TURN = 'end_current_player_turn',
    UPDATE_MY_GAME_PLAYER_INFO = 'update_my_game_player_info', // arg1: GamePlayerInfo
    UPDATE_MY_MONEY = 'update_my_money', // arg1 = money amound
    PROMPT_PURCHASE = 'prompt_purchase', // arg1: PromptPurchasePayload
    PURCHASE_DECISION = 'purchase_decision', // arg1: boolean
    NO_MORE_PACKET_FROM_SERVER_FOR_CURRENT_TURN = 'no_more_packet_from_server_for_current_turn',
    // Game over, show ranking of players' worth
    SHOW_RANKING = 'show_ranking',
    // ranking list close after timeout or player manually tap anywhere to close
    // it. Player should then be brought back to room view.
    RANKING_CLOSED = 'ranking_closed',

    // player click on the leave room button while in game
    LEAVE_ROOM = 'leave_room',
    ANIMATION = 'animation',
    // receive server request, asking current player to confirm after reading
    // the chance card.
    PROMPT_CHANCE_CONFIRMATION = 'prompt_chance_confirmation',
    // current player click on the screen to dismiss the chance card
    CONFIRM_CHANCE = 'confirm_chance',
}
