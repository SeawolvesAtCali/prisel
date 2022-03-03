import { tic_tac_toepb } from '@prisel/protos';
import {
    actionPacketEvent,
    broadcast,
    debug,
    Packet,
    TurnOrder,
    useEventHandler,
} from '@prisel/server';
import {
    endState,
    newState,
    useComputed,
    useLocalState,
    useSideEffect,
    useStored,
} from '@prisel/state';

export function TicTacToeState(props: { turnOrder: TurnOrder }) {
    const map = useStored(new Array(9).fill(''));
    const { turnOrder } = props;
    const [gameOver, setGameOver] = useLocalState(false);
    const firstPlayerId = useComputed(() => turnOrder.getCurrentPlayer()?.getId(), []);

    useSideEffect(() => {
        // sending initial state
        broadcast(
            turnOrder.getAllPlayers(),
            Packet.forAction('game_state')
                .setPayload(tic_tac_toepb.GameStatePayload, {
                    player: turnOrder.getAllPlayers().map((player) => player.getId()),
                    map: map.current,
                    currentPlayer: turnOrder.getCurrentPlayer()?.getId() ?? '',
                })
                .build(),
        );
    }, []);
    useEventHandler(actionPacketEvent('move'), ({ player, packet }) => {
        if (player.getId() != turnOrder.getCurrentPlayer()?.getId()) {
            return;
        }
        const sign = turnOrder.getCurrentPlayer()?.getId() === firstPlayerId ? 'O' : 'X';
        const currentMap = map.current;

        const newMove = Packet.getPayload(packet, tic_tac_toepb.MovePayload)?.position;
        if (
            typeof newMove === 'number' &&
            newMove < 9 &&
            newMove >= 0 &&
            currentMap[newMove] === ''
        ) {
            currentMap[newMove] = sign;
            map.current = currentMap;
        } else {
            debug('invalid move');
            return;
        }

        let winnerText = '';
        if (checkWin(currentMap)) {
            setGameOver(true);
            winnerText = `${turnOrder.getCurrentPlayer()?.getName() || ''} won!`;
        } else if (isEven(currentMap)) {
            setGameOver(true);
            winnerText = `It's a tie!`;
        }
        turnOrder.giveTurnToNext();
        const newGameStateMessage = Packet.forAction('game_state')
            .setPayload(tic_tac_toepb.GameStatePayload, {
                player: turnOrder.getAllPlayers().map((player) => player.getId()),
                map: currentMap,
                currentPlayer: turnOrder.getCurrentPlayer()?.getId() ?? '',
                winner: winnerText,
            })
            .build();
        broadcast(turnOrder.getAllPlayers(), newGameStateMessage);
    });

    if (gameOver) {
        return newState(TicTacToeEnding, { turnOrder });
    }
}

function TicTacToeEnding(props: { turnOrder: TurnOrder }) {
    const { turnOrder } = props;
    const [done, setDone] = useLocalState(false);
    useSideEffect(() => {
        // end the game 500 ms later to allow clients to paint the last move
        const timeoutId = setTimeout(() => {
            broadcast(turnOrder.getAllPlayers(), Packet.forAction('game_over').build());
            setDone(true);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, []);

    if (done) {
        return endState();
    }
}

export function checkWin(map: string[]) {
    for (let i = 0; i < 3; i++) {
        if (map[3 * i] !== '' && map[3 * i] === map[3 * i + 1] && map[3 * i] === map[3 * i + 2]) {
            debug('win');
            return true;
        }
        if (map[i] !== '' && map[i] === map[i + 3] && map[i] === map[i + 6]) {
            debug('win');
            return true;
        }
    }
    if (map[0] !== '' && map[0] === map[4] && map[0] === map[8]) {
        return true;
    }
    if (map[2] !== '' && map[2] === map[4] && map[2] === map[6]) {
        return true;
    }
    return false;
}

export const isEven = (map: string[]) => {
    const hasEmpty = map.some((element: string) => {
        return element === '';
    });
    return !hasEmpty;
};
