import { typeRegistry } from '@prisel/common';
import {
    animation_spec,
    announce_bankrupt_spec,
    announce_end_turn_spec,
    announce_game_over_spec,
    announce_pay_rent_spec,
    announce_player_left_spec,
    announce_purchase_spec,
    announce_received_chance_spec,
    announce_roll_spec,
    announce_start_turn_spec,
    get_initial_state_spec,
    prompt_purchase_spec,
    roll_spec,
} from '@prisel/protos';

const {
    DiceDownExtra,
    DiceRollExtra,
    FocusLandExtra,
    InvestedExtra,
    MoveExtra,
    OpenChanceChestExtra,
    PanExtra,
    PayRentExtra,
    PlayerEmotionExtra,
    TurnStartExtra,
} = animation_spec;

// Register Animation Extras
typeRegistry.push(
    DiceDownExtra,
    DiceRollExtra,
    FocusLandExtra,
    InvestedExtra,
    MoveExtra,
    OpenChanceChestExtra,
    PanExtra,
    PayRentExtra,
    PlayerEmotionExtra,
    TurnStartExtra,
);

// Register Payload types
typeRegistry.push(
    animation_spec.AnimationPayload,
    announce_bankrupt_spec.AnnounceBankruptPayload,
    announce_end_turn_spec.AnnounceEndTurnPayload,
    announce_game_over_spec.AnnounceGameOverPayload,
    announce_pay_rent_spec.AnnouncePayRentPayload,
    announce_player_left_spec.AnnouncePlayerLeftPayload,
    announce_purchase_spec.AnnouncePurchasePayload,
    announce_received_chance_spec.AnnounceRecievedChancePayload,
    announce_roll_spec.AnnounceRollPayload,
    announce_received_chance_spec.AnnounceRecievedChancePayload,
    announce_roll_spec.AnnounceRollPayload,
    announce_start_turn_spec.AnnounceStartTurnPayload,
    get_initial_state_spec.GetInitialStateResponse,
    prompt_purchase_spec.PromptPurchaseRequest,
    prompt_purchase_spec.PromptPurchaseResponse,
    roll_spec.RollResponse,
);
