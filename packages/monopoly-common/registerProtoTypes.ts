import { typeRegistry } from '@prisel/common';
import { monopolypb } from '@prisel/protos';

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
} = monopolypb;

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
    monopolypb.AnimationPayload,
    monopolypb.AnnounceBankruptPayload,
    monopolypb.AnnounceEndTurnPayload,
    monopolypb.AnnounceGameOverPayload,
    monopolypb.AnnouncePayRentPayload,
    monopolypb.AnnouncePlayerLeftPayload,
    monopolypb.AnnouncePurchasePayload,
    monopolypb.AnnounceRecievedChancePayload,
    monopolypb.AnnounceRollPayload,
    monopolypb.AnnounceRecievedChancePayload,
    monopolypb.AnnounceRollPayload,
    monopolypb.AnnounceStartTurnPayload,
    monopolypb.GetInitialStateResponse,
    monopolypb.PromptPurchaseRequest,
    monopolypb.PromptPurchaseResponse,
    monopolypb.RollResponse,
);
