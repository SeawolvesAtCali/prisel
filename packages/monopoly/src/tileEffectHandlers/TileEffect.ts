import { GamePlayer, TileEffectInput, TileEffectInputArgs } from '@prisel/monopoly-common';
import { StateMachineConstructor } from '../stateMachine/StateMachineState';
export interface TileEffect<T extends keyof TileEffectInputArgs> {
    input: TileEffectInput<T>;
    onEffect(gamePlayer: GamePlayer): Promise<StateMachineConstructor | void>;
}
