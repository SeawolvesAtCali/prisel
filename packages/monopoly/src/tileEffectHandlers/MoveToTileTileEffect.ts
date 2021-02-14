import { GamePlayer, TileEffectInput } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { State } from '../stateMachine/stateEnum';
import { TileEffect } from './TileEffect';

export class MoveToTileTileEffect implements TileEffect<'move_to_tile'> {
    public input: TileEffectInput<'move_to_tile'>;

    constructor(input: TileEffectInput<'move_to_tile'>) {
        this.input = input;
    }

    public onEffect(player: GamePlayer): Promise<void | State> {
        switch (this.input.timing) {
            case monopolypb.TileEffect_Timing.ENTERING:
            //
        }
        throw new Error('Method not implemented.');
    }

    // private onEntering(player: GamePlayer): Promise<void | StateMachineConstructor> {

    // }

    // private onStopping(player: GamePlayer):
}
