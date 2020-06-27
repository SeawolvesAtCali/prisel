import { Client, PacketType, Messages } from '@prisel/client';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';

export const phases = {
    LOGIN: 0,
    LOBBY: 1,
    ROOM: 2,
    GAME: 3,
};
/**
 * @typedef {import('@prisel/client').PlayerInfo} PlayerInfo
 */

export function useConnected(initial = false) {
    const connectedRef = useRef(initial);
    return [connectedRef.current, (newConnected) => (connectedRef.current = newConnected)];
}

export function useRoomState() {
    const [roomId, setRoomId] = useState(/** @type {string} */ (undefined));
    const [roomName, setRoomName] = useState(/** @type {string} */ (undefined));
    const [players, setPlayers] = useState(/** @type {PlayerInfo[]} */ ([]));
    const [host, setHost] = useState(/** @type {string} */ (undefined));

    const onJoin = useCallback((
        /** @type {import('@prisel/client').JoinResponsePayload} */
        joinResponsePayload,
    ) => {
        const { room, roomState } = joinResponsePayload;
        setRoomId(room.id);
        setRoomName(room.name);
        setPlayers(roomState.players);
        setHost(roomState.hostId);
    }, []);

    const onCreateRoom = useCallback((
        /** @type {import('@prisel/client').CreateRoomResponsePayload} */
        createRoomResponsePayload,
    ) => {
        const { room, roomState } = createRoomResponsePayload;
        setRoomId(room.id);
        setRoomName(room.name);
        setPlayers(roomState.players);
        setHost(roomState.hostId);
    }, []);

    const onRoomStateChange = useCallback((
        /** @type {import('@prisel/client').RoomChangePayload} */
        roomChangePayload,
    ) => {
        if (roomChangePayload.playerJoin) {
            setPlayers((oldPlayers) => oldPlayers.concat(roomChangePayload.playerJoin));
        }
        if (roomChangePayload.playerLeave) {
            setPlayers((oldPlayers) =>
                oldPlayers.filter((player) => player.id !== roomChangePayload.playerLeave.id),
            );
        }
        if (roomChangePayload.hostLeave) {
            setPlayers((oldPlayers) =>
                oldPlayers.filter((player) => player.id !== roomChangePayload.hostLeave.hostId),
            );
            setHost(roomChangePayload.hostLeave.newHostId);
        }
    }, []);

    const onLeave = useCallback(() => {
        // clear room state
        setPlayers([]);
        setHost(undefined);
    }, []);

    return { roomId, roomName, players, host, onJoin, onRoomStateChange, onLeave, onCreateRoom };
}

const initialGameState = {
    winner: /** @type {string} */ (undefined),
    currentPlayer: /** @type {string} */ (undefined),
    map: [],
    player: /** @type {string[]} */ [],
};

/**
 * @param {Client} client client
 * @param {function(string): void} onEnd callback triggered when game ends
 */
export function useGameState(client, onEnd) {
    const [gameState, setGameState] = useState(initialGameState);
    const [winner, setWinner] = useState(undefined);
    const endRef = useRef(null);
    endRef.current = onEnd;
    const handleMove = useCallback(
        (index) => {
            const movePacket = {
                type: PacketType.DEFAULT,
                action: 'MESSAGE',
                payload: index,
            };
            client.emit(movePacket);
        },
        [client],
    );

    useEffect(() => {
        return client.on('GAME_STATE', (packet) => {
            const newState = packet.payload;
            setGameState(newState);
            if (newState.winner) {
                setWinner(newState.winner);
            }
        });
    }, [client]);

    useEffect(() => {
        return client.on('GAME_OVER', (packet) => {
            setGameState(initialGameState);
            endRef.current(winner);
        });
    }, [winner, client]);

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

/** @typedef {import('@prisel/client').ResponseWrapper} ResponseWrapper */
/** @typedef {import('@prisel/client').LoginResponsePayload} LoginResponsePayload */

export function useClient(url, connectedRef) {
    const client = useMemo(() => {
        return new Client(url);
    }, [url]);
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
    }, [client, connectedRef]);
    async function login(username) {
        if (!connectedRef.current) {
            return;
        }
        /** @type {ResponseWrapper<LoginResponsePayload>} */
        const loginInfo = await client.request(Messages.getLogin(client.newId(), username));
        if (connectedRef.current) {
            return { id: loginInfo.payload.userId, name: username };
        }
        throw new Error('disconnected while trying to login');
    }
    return { client, login };
}
