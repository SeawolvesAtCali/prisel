import { tic_tac_toepb } from '@prisel/protos';
import {
    actionPacketEvent,
    broadcast,
    debug,
    Packet,
    Player,
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

export function TicTacToeState(props: { players: { current: Player[] } }) {
    const map = useStored(new Array(9).fill(''));
    const { players } = props;
    const [currentPlayer, setCurrentPlayer] = useLocalState(0);
    const [winner, setWinner] = useLocalState<number[]>([]);
    const playerIds = useComputed(() => players.current.map((player) => player.getId()), []);

    useSideEffect(() => {
        // sending initial state
        broadcast(
            players.current,
            Packet.forAction('game_state')
                .setPayload(tic_tac_toepb.GameStatePayload, {
                    player: playerIds,
                    map: map.current,
                    currentPlayer,
                })
                .build(),
        );
    }, []);
    useEventHandler(
        actionPacketEvent('move'),
        ({ player, packet }) => {
            if (player.getId() != playerIds[currentPlayer]) {
                return;
            }
            const sign = currentPlayer === 0 ? 'O' : 'X';
            const nextPlayer = 1 - currentPlayer;
            setCurrentPlayer(nextPlayer);
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

            let winnerId = '';
            if (checkWin(currentMap)) {
                setWinner([currentPlayer]);
                winnerId = players.current[currentPlayer].getId();
            } else if (isEven(currentMap)) {
                setWinner([0, 1]); // both are winner
                winnerId = 'even';
            }
            const newGameStateMessage = Packet.forAction('game_state')
                .setPayload(tic_tac_toepb.GameStatePayload, {
                    player: playerIds,
                    map: currentMap,
                    currentPlayer: nextPlayer,
                    winner: winnerId,
                })
                .build();
            broadcast(players.current, newGameStateMessage);
        },
        [currentPlayer],
    );

    if (winner.length > 0) {
        return newState(TicTacToeEnding, { winner, players });
    }
}

function TicTacToeEnding(props: { winner: number[]; players: { current: Player[] } }) {
    const { players } = props;
    const [done, setDone] = useLocalState(false);
    useSideEffect(() => {
        // end the game 500 ms later to allow clients to paint the last move
        const timeoutId = setTimeout(() => {
            broadcast(players.current, Packet.forAction('game_over').build());
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
