import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Client, Messages, PacketType } from '@prisel/client';
import Context from './context';
import Login from './Login';
import Lobby from './Lobby';
import Room from './Room';
import Game from './Game';
import {
    getInitialRoomState,
    onRoomStateChange,
    onRoomJoin,
    phases,
    useConnected,
    useRoomState,
    useUserInfo,
    useClient,
    useGameState,
} from './state';

function App() {
    const [phase, setPhase] = useState(phases.LOGIN);
    const connectedRef = useRef(false);
    const { roomId, roomName, players, host, onJoin, onRoomStateChange } = useRoomState();
    const { id, name, setUserInfo } = useUserInfo();

    const { client, login } = useClient(process.env.SERVER, connectedRef);
    useEffect(() => {
        return client.onRoomStateChange(onRoomStateChange);
    }, [client]);
    useEffect(() => {
        return client.onGameStart(() => {
            setPhase(phases.GAME);
        });
    }, [client]);
    const handleGameOver = (winner) => {
        window.alert('winner: ' + winner);
        setPhase(phases.ROOM);
    };
    const { gameState, handleMove } = useGameState(client, handleGameOver);

    const handleLogin = (username) =>
        login(username).then(({ id, name }) => {
            setUserInfo(id, name);
            setPhase(phases.LOBBY);
        });
    const handleCreate = async (roomName) => {
        const response = await client.request(Messages.getCreateRoom(client.newId(), roomName));
        onJoin(response.payload);
        setPhase(phases.ROOM);
    };
    const handleJoin = async (roomId) => {
        const response = await client.request(Messages.getJoin(client.newId(), roomId));

        onJoin(response.payload);
        setPhase(phases.ROOM);
    };
    const handleStart = () => {
        return client.request(Messages.getGameStart(client.newId()));
    };
    const context = {
        id,
        roomId,
        roomName,
        players,
        host,
        gameState,
    };

    // render
    const Phase = (() => {
        switch (phase) {
            case phases.LOGIN:
                return <Login onLogin={handleLogin} />;
            case phases.LOBBY:
                return <Lobby onCreate={handleCreate} onJoin={handleJoin} />;
            case phases.ROOM:
                return <Room onStart={handleStart} />;
            case phases.GAME:
                return <Game onMove={handleMove} />;
        }
    })();
    return <Context.Provider value={context}>{Phase}</Context.Provider>;
}

export default App;
