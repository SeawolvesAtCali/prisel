export enum Action {
    UNSPECIFIED = '',

    // request/response
    // initiate from client
    DEBUG = 'debug',

    // request/response
    // initiate from client
    ROLL = 'roll',

    // packet from server
    // include encounters of current player after moved.
    // deprecated
    ENCOUNTER = 'encounter',

    // request/response
    // initiate from client
    // deprecated
    PURCHASE = 'purchase',

    // request/response
    // initiate from server
    PROMPT_PURCHASE = 'prompt_purchase',

    // request/response
    // initiate from client
    END_TURN = 'endturn',

    // from client
    GET_INITIAL_STATE = 'get_initial_state',

    // from client
    // after displaying the ranking info, player request to go back to room
    // scene to wait for the next game.
    BACK_TO_ROOM = 'back_to_room',

    // from client. After receiving ANNOUNCE_END_TURN, client should flush any
    // animation about current player, and pan view to the next player. Then
    // send READY_TO_START_TURN to server. Server will synchronize and broadcase
    // ANNOUNCE_START_TURN to all clients.
    READY_TO_START_TURN = 'ready_to_start_turn',
    // from client. After setting up initial state, client should send this to
    // server. When server receives READY_TO_START_GAME from all client, it will
    // start game.
    READY_TO_START_GAME = 'ready_to_start_game',

    // packet to annouce a player to start a turn.
    ANNOUNCE_START_TURN = 'announce_start_turn',
    ANNOUNCE_ROLL = 'announce_roll',
    ANNOUNCE_PURCHASE = 'announce_purchase',

    // announce a player pay rent to another player. Although this information
    // is available in ANNOUNCE_ROLL's encounter, we still need a message to
    // tell the landlord player their new networth.
    ANNOUNCE_PAY_RENT = 'announce_pay_rent',
    // packet to announce a player finished turn.
    // this immediately follows END_TURN response from current player. After
    // receiving this packet, Other players should send back READY_TO_START_TURN
    // when they finish animations of current player and pan to the next player.
    ANNOUNCE_END_TURN = 'announce_end_turn',
    // a player go bankrupt, announce it to all players. This ends the game.
    ANNOUNCE_BANKRUPT = 'announce_bankrupt',
    ANNOUNCE_GAME_OVER = 'announce_game_over',
    ANNOUNCE_PLAYER_LEFT = 'announce_player_left',
    // request/response
    // initiate from server
    // prompt current player for acknowledging the received chance card.
    PROMPT_CHANCE_CONFIRMATION = 'prompt_chance_confirmation',
    ANNOUNCE_CHANCE = 'announce_chance',
    ANIMATION = 'animation', // server request client play an animation
}

// Server Client
// <- GET_INITIAL_STATE
// -> GET_INITIAL_STATE response

// <= READY_TO_START_TURN
// => PLAYER_START_TURN (first player)
// <- ROLL
// -> ROLL response, including charge, new property info
// => ANNOUNCE_ROLL
// <- PURCHASE
// -> PURCHASE response
// => ANNOUNC_PURCHASE
// <- END_TURN
// -> END_TURN response
// => PLAYER_END_TURN

// <= READY_TO_START_TURN
// => PLAYER_START_TURN (second player)
// <- ROLL
// (assuming this player need to pay rent)
// -> ROLL response, including charge
//
// ...
// => ANNOUNCE_BANKRUPT
// => ANNOUNCE_GAME_OVER
//
