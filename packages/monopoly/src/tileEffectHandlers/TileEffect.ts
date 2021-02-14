import { GamePlayer, TileEffectInput, TileEffectInputArgs } from '@prisel/monopoly-common';
import { State } from '../stateMachine/stateEnum';
export interface TileEffect<T extends keyof TileEffectInputArgs> {
    input: TileEffectInput<T>;
    onEffect(gamePlayer: GamePlayer): Promise<State | void>;
}
