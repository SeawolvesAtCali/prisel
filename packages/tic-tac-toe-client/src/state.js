import { Client, Messages, Packet, RoomStateChangePayload } from '@prisel/client';
import { tic_tac_toepb } from '@prisel/protos';
import { useState, useRef, useEffect, useMemo, useCallback } from 'react';

export const phases = {
    LOGIN: 0,
    LOBBY: 1,
    ROOM: 2,
    GAME: 3,
};
/**
 * @typedef {import('@prisel/protos').player_info.PlayerInfo} PlayerInfo
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
        /** @type {import('@prisel/protos').join_spec.JoinResponse} */
        joinResponsePayload,
    ) => {
        const { room, roomState } = joinResponsePayload;
        setRoomId(room.id);
        setRoomName(room.name);
        setPlayers(roomState.players);
        setHost(roomState.hostId);
    }, []);

    const onCreateRoom = useCallback((
        /** @type {import('@prisel/protos').create_room_spec.CreateRoomResponse} */
        createRoomResponsePayload,
    ) => {
        const { room, roomState } = createRoomResponsePayload;
        setRoomId(room.id);
        setRoomName(room.name);
        setPlayers(roomState.players);
        setHost(roomState.hostId);
    }, []);

    const onRoomStateChange = useCallback((
        /** @type {import('@prisel/protos').room_state_change_spec.RoomStateChangePayload} */
        roomChangePayload,
    ) => {
        if (RoomStateChangePayload.isPlayerJoin(roomChangePayload)) {
            setPlayers((oldPlayers) =>
                oldPlayers.concat(RoomStateChangePayload.getJoinedPlayer(roomChangePayload)),
            );
        }
        if (RoomStateChangePayload.isPlayerLeave(roomChangePayload)) {
            const leftPlayerId = RoomStateChangePayload.getLeftPlayer(roomChangePayload);
            setPlayers((oldPlayers) => oldPlayers.filter((player) => player.id !== leftPlayerId));
        }
        if (RoomStateChangePayload.isHostLeave(roomChangePayload)) {
            const hostLeaveData = RoomStateChangePayload.getHostLeaveData(roomChangePayload);
            setPlayers((oldPlayers) =>
                oldPlayers.filter((player) => player.id !== hostLeaveData.hostId),
            );
            setHost(hostLeaveData.newHostId);
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
            const movePacket = Packet.forAction('move')
                .setPayload(tic_tac_toepb.MovePayload, {
                    position: index,
                })
                .build();
            client.emit(movePacket);
        },
        [client],
    );

    useEffect(() => {
        return client.on('game_state', (packet) => {
            const newState = Packet.getPayload(packet, tic_tac_toepb.GameStatePayload);
            setGameState(newState);
            if (newState.winner) {
                setWinner(newState.winner);
            }
        });
    }, [client]);

    useEffect(() => {
        return client.on('game_over', (packet) => {
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

/** @typedef {import('@prisel/client').Response} Response */
/** @typedef {import('@prisel/protos').login_spec.LoginResponse} LoginResponse */

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
        const loginRequest = Messages.getLogin(client.newId(), username);
        /** @type {Response} */
        const loginInfo = Packet.getPayload(await client.request(loginRequest), 'loginResponse');
        if (connectedRef.current) {
            return { id: loginInfo.userId, name: username };
        }
        throw new Error('disconnected while trying to login');
    }
    return { client, login };
}
