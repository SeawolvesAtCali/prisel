import React from 'react';
import { Client, Messages, MessageType } from '@prisel/client';
import Context from './context';
import Login from './Login';
import Lobby from './Lobby';
import Room from './Room';
import Game from './Game';

const phases = {
    LOGIN: 0,
    LOBBY: 1,
    ROOM: 2,
    GAME: 3,
};
class App extends React.Component {
    constructor(props) {
        super(props);
        this.connected = false;
        this.state = {
            phase: phases.LOGIN,
            context: {},
        };
    }

    componentDidMount() {
        this.client = new Client(process.env.SERVER);
        this.client.connect().then(() => {
            this.connected = true;
            window.addEventListener('beforeunload', () => {
                if (this.connected) {
                    console.log('disconnect');
                    this.client.exit();
                    this.connected = false;
                }
            });
            this.client.on(
                () => true,
                (data, messageType) => {
                    console.log(messageType, data);
                },
            );
        });
    }

    handleLogin = async (username) => {
        if (!this.connected) {
            return;
        }
        const loginInfo = await this.client.login(username);
        if (this.connected) {
            this.setState({
                context: {
                    ...this.state.context,
                    userId: loginInfo.userId,
                },
                phase: phases.LOBBY,
            });
        }
    };

    setupRoomStateListener() {
        this.client.on(MessageType.ROOM_UPDATE, (data) => {
            if (this.connected) {
                this.setState({
                    context: {
                        ...this.state.context,
                        roomState: data,
                    },
                });
            }
        });
    }

    listenForGameState() {
        const off = this.client.on(MessageType.GAME_STATE, (data) => {
            const newState = {
                context: {
                    ...this.state.context,
                    gameState: data,
                },
            };
            const { gameState } = newState.context;
            const { winner } = gameState;
            if (winner !== null) {
                newState.phase = phases.ROOM;
                switch (winner) {
                    case 'even':
                        newState.context.result = 'even';
                        break;
                    default:
                        newState.context.result =
                            gameState.player[winner] === this.state.context.userId
                                ? 'You won'
                                : 'You lost';
                }
                delete newState.context.gameState;
                off();
                this.waitForGameStart();
            }
            this.setState(newState);
        });
    }

    waitForGameStart = async () => {
        if (this.connected) {
            await this.client.once(
                (messageType, data) =>
                    messageType === MessageType.SUCCESS && data.action === MessageType.GAME_START,
            );
            if (this.connected) {
                this.setState({
                    phase: phases.GAME,
                });
                this.listenForGameState();
            }
        }
    };

    handleCreateRoom = async (roomName) => {
        if (!this.connected) {
            return;
        }
        this.client.emit(...Messages.getCreateRoom(roomName, 'tic-tac-toe'));

        await this.client.once(
            (messageType, data) =>
                messageType === MessageType.SUCCESS && data.action === MessageType.CREATE_ROOM,
        );

        if (this.connected) {
            this.setState({
                phase: phases.ROOM,
            });
            this.setupRoomStateListener();
        }
        this.waitForGameStart();
    };

    handleJoinRoom = async (roomId) => {
        if (!this.connected) {
            return;
        }
        this.client.emit(...Messages.getJoin(roomId));
        await this.client.once(
            (messageType, data) =>
                messageType === MessageType.SUCCESS && data.action === MessageType.JOIN,
        );
        if (this.connected) {
            this.setState({
                phase: phases.ROOM,
            });
            this.setupRoomStateListener();
        }
        this.waitForGameStart();
    };

    handleReady = () => {
        if (!this.connected) {
            return;
        }
        this.client.emit(...Messages.getReady());
    };

    handleStart = async () => {
        if (!this.connected) {
            return;
        }
        this.client.emit(...Messages.getGameStart());
    };

    handleMove = (index) => {
        if (!this.connected) {
            return;
        }
        this.client.emit(...Messages.getMessage({ index }));
    };

    render() {
        const Phase = (() => {
            switch (this.state.phase) {
                case phases.LOGIN:
                    return <Login onLogin={this.handleLogin} />;
                case phases.LOBBY:
                    return <Lobby onCreate={this.handleCreateRoom} onJoin={this.handleJoinRoom} />;
                case phases.ROOM:
                    return <Room onReady={this.handleReady} onStart={this.handleStart} />;
                case phases.GAME:
                    return <Game onMove={this.handleMove} />;
            }
        })();
        return <Context.Provider value={this.state.context}>{Phase}</Context.Provider>;
    }
}
export default App;
