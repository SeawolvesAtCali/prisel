import { Action } from '../../common/messages';
import {
    StateConfig,
    syncAction,
    serverBroadcast,
    sequence,
    currentPlayerAction,
} from './stateMachine';

const states: StateConfig[] = [
    {
        name: 'started',
        description: 'game started',
        transitions: [
            {
                to: 'setupFinished',
                condition: {
                    type: 'no condition',
                },
            },
        ],
    },
    {
        name: 'setupFinished',
        description:
            'All clients finish loading the game scene and are ready to receive game packets. Server should broadcast INITIAL_STATE to clients',
        transitions: [
            {
                to: 'waitingTurnStart',
                condition: sequence(
                    serverBroadcast('initialState'),
                    syncAction(Action.READY_TO_START_TURN),
                ),
            },
        ],
    },
    {
        name: 'waitingTurnStart',
        description:
            "All clients finished positioning the players on board and finished panning to the next player's position on board. All animations for last player are finished",
        transitions: [
            {
                to: 'playerTurn',
                condition: serverBroadcast('playerStartTurn'),
            },
        ],
    },
    {
        name: 'playerTurn',
        description: 'Current player taking actions in the turn',
        transitions: [
            {
                to: 'playerRolled',
                condition: sequence(
                    currentPlayerAction(Action.ROLL),
                    serverBroadcast('announcPlayerRoll'),
                ),
            },
            {
                to: 'playerTurn',
                condition: sequence(
                    currentPlayerAction(Action.PURCHASE),
                    serverBroadcast('announcePlayerPurchase'),
                ),
            },
        ],
    },
    {
        name: 'playerRolled',
        transitions: [
            {
                to: 'playerRolled',
                condition: sequence(
                    currentPlayerAction(Action.PURCHASE),
                    serverBroadcast('announcePlayerPurchase'),
                ),
            },
            {
                to: 'playerEndingTurn',
                condition: sequence(
                    currentPlayerAction(Action.END_TURN),
                    serverBroadcast('announcePlayerEndTurn'),
                ),
            },
        ],
    },
    {
        name: 'playerEndingTurn',
        transitions: [
            {
                to: 'waitingTurnStart',
                condition: syncAction(Action.READY_TO_START_TURN),
            },
        ],
    },
];
