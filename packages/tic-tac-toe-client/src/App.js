import React, { useState, useRef, useEffect } from 'react';
import { Messages, Packet } from '@prisel/client';
import Context from './context';
import Login from './Login';
import Lobby from './Lobby';
import Room from './Room';
import Game from './Game';
import { phases, useRoomState, useUserInfo, useClient, useGameState } from './state';

function App() {
    const [phase, setPhase] = useState(phases.LOGIN);
    const connectedRef = useRef(false);
    const { roomId, roomName, players, host, onJoin, onRoomStateChange, onLeave } = useRoomState();
    const { id, setUserInfo } = useUserInfo();

    const { client, login } = useClient(process.env.SERVER, connectedRef);
    useEffect(() => {
        return client.onRoomStateChange(onRoomStateChange);
    }, [client, onRoomStateChange]);
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
        if (Packet.isStatusOk(response)) {
            onJoin(Packet.getPayload(response, 'createRoomResponse'));
            setPhase(phases.ROOM);
        } else {
            client.log(Packet.getStatusMessage(response));
        }
    };
    const handleJoin = async (roomId) => {
        const response = await client.request(Messages.getJoin(client.newId(), roomId));
        if (Packet.isStatusOk(response)) {
            onJoin(Packet.getPayload(response, 'joinResponse'));
            setPhase(phases.ROOM);
        } else {
            client.log(Packet.getStatusMessage(response));
        }
    };
    const handleLeave = async () => {
        const response = await client.request(Messages.getLeave(client.newId()));
        if (Packet.isStatusOk(response)) {
            onLeave();
            setPhase(phases.LOBBY);
        }
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
                return <Room onStart={handleStart} onLeave={handleLeave} />;
            case phases.GAME:
                return <Game onMove={handleMove} />;
            default:
                return null;
        }
    })();
    return <Context.Provider value={context}>{Phase}</Context.Provider>;
}

export default App;
