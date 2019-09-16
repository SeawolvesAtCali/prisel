import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
    createClient,
    connect,
    login,
    ClientState,
    getGameAndRoomTypes,
    createRoom,
    AddToLogs,
    joinRoom,
} from './utils';
import GameContext from '../GameContext';
import LogPanel, { MessageWithMetaData, createMessage } from '../LogPanel';
import { Client, MessageType } from '@prisel/client';
import Container from '../Container';
import Suggestion from '../Suggestion';
import Prompt from '../Prompt';
import run from '../commandInput/runCommand';

interface HostContainerProps {
    username: string;
}

function useRun(client: Client, addToLogs: AddToLogs) {
    const onRun = useCallback(
        (suggestions: Suggestion[]) => {
            if (!client) {
                return;
            }
            run(
                suggestions,
                (key) => {},
                (json) => {
                    const { type, payload } = json;
                    client.emit(type, payload);
                    addToLogs({
                        origin: 'client',
                        payload,
                        command: suggestions,
                        type,
                    });
                },
            );
        },
        [client],
    );
    return onRun;
}

function useLog(): [MessageWithMetaData[], AddToLogs] {
    const [logs, setLogs] = useState<MessageWithMetaData[]>([]);
    const addToLogs: AddToLogs = useCallback((message) => {
        setLogs((prevLogs) => prevLogs.concat([createMessage(message)]));
    }, []);
    return [logs, addToLogs];
}

export function HostContainer({ username }: HostContainerProps) {
    const { setRoomAndGameType, setRoomInfo, setRoomId } = useContext(GameContext);
    const [logs, addToLogs] = useLog();
    const [client, setClient] = useState<Client<ClientState>>(null);
    useEffect(() => {
        (async () => {
            const myClient = await createClient(username, addToLogs);
            await connect(myClient);
            setClient(myClient);
            await login(myClient);

            const { gameTypes, roomTypes } = await getGameAndRoomTypes(myClient);
            // pick the first game and room type;
            const firstGameType = gameTypes[0];
            const firstRoomType = roomTypes[0];
            setRoomId(await createRoom(myClient, firstGameType, firstRoomType));
            setRoomAndGameType(firstRoomType, firstGameType);
            myClient.on(MessageType.ROOM_UPDATE, (data) => {
                myClient.log(data);
                setRoomInfo(data as any);
            });
        })();
    }, []);
    const onRun = useRun(client, addToLogs);

    return (
        <Container>
            <LogPanel messages={logs} />
            <Prompt onSubmit={onRun} />
        </Container>
    );
}

interface GuestContainerProps {
    username: string;
    roomId: string;
}

export function GuestContainer({ username, roomId }: GuestContainerProps) {
    const [logs, addToLogs] = useLog();
    const [client, setClient] = useState<Client<ClientState>>(null);
    useEffect(() => {
        (async () => {
            const myClient = await createClient(username, addToLogs);
            await connect(myClient);
            setClient(myClient);
            await login(myClient);

            await joinRoom(myClient, roomId);
        })();
    }, []);
    const onRun = useRun(client, addToLogs);

    return (
        <Container>
            <LogPanel messages={logs} />
            <Prompt onSubmit={onRun} />
        </Container>
    );
}
