import { GamePlayer, TileEffectInput } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { StateMachineConstructor } from '../stateMachine/StateMachineState';
import { TileEffect } from './TileEffect';

export class MoveToTileTileEffect implements TileEffect<'move_to_tile'> {
    public input: TileEffectInput<'move_to_tile'>;

    constructor(input: TileEffectInput<'move_to_tile'>) {
        this.input = input;
    }

    public onEffect(player: GamePlayer): Promise<void | StateMachineConstructor> {
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
