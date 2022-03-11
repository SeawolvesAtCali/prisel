import { TurnOrder } from '@prisel/server';
import { newState, run, useSideEffect } from '@prisel/state';
import { useInitialState } from './state';
import { GameStartedState } from './stateMachine/GameStarted';
import { provideGame, setGamePlayer } from './stateMachine/utils';
import { pipe } from './utils';

export function GameState(props: { turnOrder: TurnOrder }) {
    const { turnOrder } = props;
    const game = useInitialState(turnOrder, setGamePlayer);
    useSideEffect(() => {
        if (game) {
            run(pipe(newState(GameStartedState, { turnOrder }), provideGame(game)));
        }
    }, [game]);
}
