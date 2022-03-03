import { Client, Messages, Packet, RoomStateChangePayload } from '@prisel/client';
import { priselpb, tic_tac_toepb } from '@prisel/protos';
import { MutableRefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const phases = {
    LOGIN: 0,
    ROOM: 2,
    GAME: 3,
};

export function useConnected(initial = false): [boolean, (newConnected: boolean) => void] {
    const connectedRef = useRef(initial);
    return [connectedRef.current, (newConnected: boolean) => (connectedRef.current = newConnected)];
}

export function useRoomState() {
    const [roomId, setRoomId] = useState<string>();
    const [roomName, setRoomName] = useState<string>();
    const [players, setPlayers] = useState<priselpb.PlayerInfo[]>([]);
    const [host, setHost] = useState<string>();
    const roomStateToken = useRef('');

    const onJoin = useCallback((joinResponsePayload: priselpb.JoinResponse) => {
        const { room, roomState } = joinResponsePayload;
        if (room) {
            setRoomId(room.id);
            setRoomName(room.name);
        }
        if (roomState) {
            setPlayers(roomState.players);
            setHost(roomState.hostId);
            roomStateToken.current = roomState.token;
        }
    }, []);

    const onCreateRoom = useCallback((createRoomResponsePayload: priselpb.CreateRoomResponse) => {
        const { room, roomState } = createRoomResponsePayload;
        if (room) {
            setRoomId(room.id);
            setRoomName(room.name);
        }
        if (roomState) {
            setPlayers(roomState.players);
            setHost(roomState.hostId);
        }
    }, []);

    const onRoomStateChange = useCallback((roomChangePayload: priselpb.RoomStateChangePayload) => {
        if (roomChangePayload.token?.token === roomStateToken.current) {
            // do nothing;
            return;
        } else {
            roomStateToken.current = roomChangePayload.token?.token ?? '';
        }
        if (RoomStateChangePayload.isPlayerJoin(roomChangePayload)) {
            setPlayers((oldPlayers) => {
                const newPlayer = RoomStateChangePayload.getJoinedPlayer(roomChangePayload);
                if (newPlayer) {
                    return [...oldPlayers, newPlayer];
                }
                return oldPlayers;
            });
        }
        if (RoomStateChangePayload.isPlayerLeave(roomChangePayload)) {
            const leftPlayerId = RoomStateChangePayload.getLeftPlayer(roomChangePayload);
            setPlayers((oldPlayers) => oldPlayers.filter((player) => player.id !== leftPlayerId));
        }
        if (RoomStateChangePayload.isHostLeave(roomChangePayload)) {
            const hostLeaveData = RoomStateChangePayload.getHostLeaveData(roomChangePayload);
            setPlayers((oldPlayers) =>
                oldPlayers.filter((player) => player.id !== hostLeaveData?.hostId),
            );
            if (hostLeaveData) {
                setHost(hostLeaveData.newHostId);
            }
        }
    }, []);

    return { roomId, roomName, players, host, onJoin, onRoomStateChange, onCreateRoom };
}

const initialGameState: tic_tac_toepb.GameStatePayload = {
    winner: undefined,
    currentPlayer: '',
    map: [],
    player: [],
};

export function useGameState(client: Client, onEnd: (winner: string) => void) {
    const [gameState, setGameState] = useState(initialGameState);
    const [winner, setWinner] = useState<string>();
    const endRef = useRef<(winner: string) => void>();
    endRef.current = onEnd;
    const handleMove = useCallback(
        (index: number) => {
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
            if (newState) {
                setGameState(newState);
                if (newState.winner) {
                    setWinner(newState.winner);
                }
            }
        });
    }, [client]);

    useEffect(() => {
        return client.on('game_over', (packet) => {
            setGameState(initialGameState);
            if (endRef.current && winner) {
                endRef.current(winner);
            }
        });
    }, [winner, client]);

    return { gameState, handleMove };
}

export function useUserInfo() {
    const [userId, setUserId] = useState<string>();
    const [username, setUsername] = useState<string>();
    return {
        id: userId,
        name: username,
        setUserInfo(newId: string, newName: string) {
            setUserId(newId);
            setUsername(newName);
        },
    };
}

async function clientSetup(client: Client) {
    return await client.connect();
}

export function useClient(url: string | undefined, connectedRef: MutableRefObject<boolean>) {
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
    async function login(username: string) {
        if (!connectedRef.current) {
            throw new Error('cannot login while not connected');
        }
        const loginRequest = Messages.getLogin(client.newId(), username);
        const loginInfo = Packet.getPayload(await client.request(loginRequest), 'loginResponse');
        if (connectedRef.current && loginInfo) {
            return { id: loginInfo.userId, name: username };
        }
        throw new Error('disconnected while trying to login');
    }
    return { client, login };
}
