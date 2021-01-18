import { Client, Request } from '@prisel/client';
import { priselpb } from '@prisel/protos';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import Container, { BorderBox } from '../Container';
import GameContext from '../GameContext';
import LogPanel, { createMessage, MessageWithMetaData } from '../LogPanel';
import Prompt from '../Prompt';
import Suggestion from '../Suggestion';
import run from '../suggestionProviders/runCommand';
import {
    AddToLogs,
    ClientState,
    connect,
    createClient,
    createRoom,
    joinRoom,
    login,
} from './utils';

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
                        case priselpb.PacketType.DEFAULT:
                        case priselpb.PacketType.RESPONSE:
                            // TODO(minor): currently, let's hardcode the
                            // response id
                            client.emit(packet);
                            break;
                        case priselpb.PacketType.REQUEST:
                            const request: Request = {
                                ...packet,
                                type: priselpb.PacketType.REQUEST,
                                requestId: client.newId(),
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
            const roomId = await createRoom(myClient);
            if (setRoomId && roomId) {
                setRoomId(roomId);
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
