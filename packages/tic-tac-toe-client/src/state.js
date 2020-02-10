import { RoomChangePayload, Client, PacketType } from '@prisel/client';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';

export const phases = {
    LOGIN: 0,
    LOBBY: 1,
    ROOM: 2,
    GAME: 3,
};

const initialRoomState = {
    id: undefined,
    name: undefined,
    host: undefined,
    players: [],
};

export function useConnected(initial = false) {
    const connectedRef = useRef(initial);
    return [connectedRef.current, (newConnected) => (connectedRef.current = newConnected)];
}

export function useRoomState() {
    const [roomId, setRoomId] = useState(undefined);
    const [roomName, setRoomName] = useState(undefined);
    const [players, setPlayers] = useState([]);
    const [host, setHost] = useState(undefined);

    const onJoin = useCallback((roomInfoPayload) => {
        setRoomId(roomInfoPayload.id);
        setRoomName(roomInfoPayload.name);
    }, []);

    const onRoomStateChange = useCallback((roomChangePayload) => {
        if (roomChangePayload.newHost) {
            setHost(roomChangePayload.newHost);
        }
        if (roomChangePayload.newJoins) {
            setPlayers((oldPlayers) => oldPlayers.concat(roomChangePayload.newJoins));
        }
        if (roomChangePayload.newLeaves) {
            setPlayers((oldPlayers) =>
                oldPlayers.filter(
                    (playerInRoom) => !roomChangePayload.newLeaves.includes(playerInRoom),
                ),
            );
        }
    }, []);

    const onLeave = useCallback(() => {
        // clear room state
        setPlayers([]);
        setHost(undefined);
    }, []);

    return { roomId, roomName, players, host, onJoin, onRoomStateChange, onLeave };
}

const initialGameState = {
    winner: undefined,
    currentPlayer: undefined,
    map: [],
    player: [],
};
export function useGameState(client, onEnd) {
    const [gameState, setGameState] = useState(initialGameState);
    const [winner, setWinner] = useState(undefined);
    const endRef = useRef(null);
    endRef.current = onEnd;
    function handleMove(index) {
        const movePacket = {
            type: PacketType.DEFAULT,
            action: 'MESSAGE',
            payload: index,
        };
        client.emit(movePacket);
    }
    useEffect(() => {
        return client.on('GAME_STATE', (packet) => {
            const newState = packet.payload;
            setGameState(newState);
            if (newState.winner) {
                setWinner(newState.winner);
            }
        });
    }, []);

    useEffect(() => {
        return client.on('GAME_OVER', (packet) => {
            setGameState(initialGameState);
            endRef.current(winner);
        });
    }, [winner]);

    return { gameState, handleMove };
}

export function useUserInfo() {
    const [userId, setUserId] = useState(undefined);
    const [username, setUsername] = useState(undefined);
    return {
        id: userId,
        name: username,
        setUserInfo(newId, newName) {
            setUserId(newId);
            setUsername(newName);
        },
    };
}

async function clientSetup(client) {
    return await client.connect();
}
export function useClient(url, connectedRef) {
    const client = useMemo(() => {
        return new Client(url);
    }, []);
    useEffect(() => {
        clientSetup(client).then(() => {
            connectedRef.current = true;
        });
        return () => {
            if (connectedRef.current) {
                console.log('disconnect');
                client.exit();
                connectedRef.current = false;
            }
        };
    }, [client]);
    async function login(username) {
        if (!connectedRef.current) {
            return;
        }
        const loginInfo = await client.login(username);
        if (connectedRef.current) {
            return { id: loginInfo.userId, name };
        }
        throw new Error('disconnected while trying to login');
    }
    return { client, login };
}
