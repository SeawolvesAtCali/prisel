import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
    createClient,
    connect,
    login,
    ClientState,
    createRoom,
    AddToLogs,
    joinRoom,
} from './utils';
import GameContext from '../GameContext';
import LogPanel, { MessageWithMetaData, createMessage } from '../LogPanel';
import { Client, PacketType, Request } from '@prisel/client';
import Container, { BorderBox } from '../Container';
import Suggestion from '../Suggestion';
import Prompt from '../Prompt';
import run from '../suggestionProviders/runCommand';

interface HostContainerProps extends BorderBox {
    username: string;
}

function useRun(client: Client | null, addToLogs: AddToLogs) {
    const onRun = useCallback(
        (suggestions: Suggestion[]) => {
            if (!client) {
                return;
            }
            run(
                suggestions,
                (key) => {},
                (packet) => {
                    switch (packet.type) {
                        case PacketType.DEFAULT:
                        case PacketType.RESPONSE:
                            // TODO(minor): currently, let's hardcode the
                            // response id
                            client.emit(packet);
                            break;
                        case PacketType.REQUEST:
                            const request: Request = {
                                ...packet,
                                type: PacketType.REQUEST,
                                request_id: client.newId(),
                            };
                            client.emit(request);
                            break;
                    }

                    addToLogs({
                        origin: 'client',
                        packet,
                        command: suggestions,
                    });
                },
            );
        },
        [client, addToLogs],
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

export function HostContainer({ username, displayBorder }: HostContainerProps) {
    const { setRoomId } = useContext(GameContext);
    const [logs, addToLogs] = useLog();
    const [client, setClient] = useState<Client<ClientState> | null>(null);
    useEffect(() => {
        (async () => {
            let shouldLogEmit = true;
            const myClient = createClient(
                username,
                // onEmit
                (packet) => {
                    if (shouldLogEmit) {
                        addToLogs({ packet, origin: 'client' });
                    }
                },
                // onPacket
                (packet) => {
                    addToLogs({ packet, origin: 'server' });
                },
            );

            await connect(myClient);
            setClient(myClient);
            await login(myClient);
            if (setRoomId) {
                setRoomId(await createRoom(myClient));
            }
            // stop logging emit because emit will be log when command is executed.
            shouldLogEmit = false;
        })();
    }, [addToLogs, setRoomId, username]);
    const onRun = useRun(client, addToLogs);

    return (
        <Container displayBorder={displayBorder}>
            <LogPanel messages={logs} />
            <Prompt onSubmit={onRun} />
        </Container>
    );
}

interface GuestContainerProps extends BorderBox {
    username: string;
    roomId: string;
}

export function GuestContainer({ username, roomId, displayBorder }: GuestContainerProps) {
    const [logs, addToLogs] = useLog();
    const [client, setClient] = useState<Client<ClientState> | null>(null);
    useEffect(() => {
        (async () => {
            let shouldLogEmit = true;
            const myClient = createClient(
                username,
                // onEmit
                (packet) => {
                    if (shouldLogEmit) {
                        addToLogs({ packet, origin: 'client' });
                    }
                },
                // onPacket
                (packet) => {
                    addToLogs({ packet, origin: 'server' });
                },
            );
            await connect(myClient);
            setClient(myClient);
            await login(myClient);
            await joinRoom(myClient, roomId);
            // stop logging emit because emit will be log when command is executed.
            shouldLogEmit = false;
        })();
    }, [addToLogs, roomId, username]);
    const onRun = useRun(client, addToLogs);

    return (
        <Container displayBorder={displayBorder}>
            <LogPanel messages={logs} />
            <Prompt onSubmit={onRun} />
        </Container>
    );
}
