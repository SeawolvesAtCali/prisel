import { Messages, Packet } from '@prisel/client';
import React, { useEffect, useRef, useState } from 'react';
import Context from './context';
import { Game } from './Game';
import { Login } from './Login';
import { Room } from './Room';
import { phases, useClient, useGameState, useRoomState, useUserInfo } from './state';

function App() {
    const [phase, setPhase] = useState(phases.LOGIN);
    const connectedRef = useRef(false);
    const { roomId, roomName, players, host, onJoin, onRoomStateChange } = useRoomState();
    const { id, setUserInfo } = useUserInfo();

    const { client, login } = useClient(getServer(), connectedRef);
    useEffect(() => {
        return client.onRoomStateChange(onRoomStateChange);
    }, [client, onRoomStateChange]);
    useEffect(() => {
        return client.onGameStart(() => {
            setPhase(phases.GAME);
        });
    }, [client]);
    const handleGameOver = (winner: string) => {
        window.alert(winner);
        setPhase(phases.ROOM);
    };
    const { gameState, handleMove } = useGameState(client, handleGameOver);

    const handleLoginAndJoin = async (username: string) => {
        const { id, name } = await login(username);
        setUserInfo(id, name);
        setPhase(phases.ROOM);
        const joinResponse = await client.request(Messages.getJoin(client.newId()));
        if (Packet.isStatusOk(joinResponse)) {
            const joinPayload = Packet.getPayload(joinResponse, 'joinResponse');
            if (joinPayload) {
                onJoin(joinPayload);
            }
            setPhase(phases.ROOM);
        } else {
            client.log(Packet.getStatusMessage(joinResponse));
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
                return <Login onLogin={handleLoginAndJoin} />;
            case phases.ROOM:
                return <Room onStart={handleStart} />;
            case phases.GAME:
                return <Game onMove={handleMove} />;
            default:
                return null;
        }
    })();
    return <Context.Provider value={context}>{Phase}</Context.Provider>;
}

function getUrlParams() {
    const queryString = window.location.search;
    return new URLSearchParams(queryString);
}
function getServer() {
    const params = getUrlParams();
    if (params.has('server')) {
        return params.get('server') || undefined;
    }
    return process.env.SERVER;
}

export default App;
