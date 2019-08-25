import * as React from 'react';
import { Card, Tag } from 'antd';
import { Client } from '@prisel/client';
import useGameAndRoomTypes from './useGameAndRoomTypes';
import LogDisplay, { Log } from './Log';
import CommandInput from './commandInput/CommandInput';
import providers from './suggestionProviders';

const { useState, useEffect, useCallback, useMemo } = React;
interface ClientContainerProps {
    username: string;
    client?: Client;
    children?: React.ReactNode;
}

export type addToLog = (
    messageType: string,
    payload: { [prop: string]: unknown },
    origin: 'server' | 'client' | 'none',
) => void;

const ClientContext = React.createContext<{
    client: Client;
    userId: string;
    username: string;
    log: addToLog;
    gameTypes: string[];
    roomTypes: string[];
}>({
    client: undefined,
    userId: '',
    username: '',
    log: undefined,
    gameTypes: [],
    roomTypes: [],
});

ClientContext.displayName = 'ClientContext';

const tabList = [
    {
        key: 'detail',
        tab: 'detail',
    },
    {
        key: 'log',
        tab: 'log',
    },
];

export function useLogs(): [
    Log[],
    (
        type: string,
        payload: { [prop: string]: unknown },
        origin: 'server' | 'client' | 'none',
    ) => void,
] {
    const [logs, setLogs] = useState([]);
    const addToLogs = useCallback(
        (
            type: string,
            payload: { [prop: string]: unknown } = {},
            origin: 'server' | 'client' | 'none' = 'none',
        ) => {
            const newLog: Log = {
                type,
                payload,
                origin,
                timestamp: new Date().getTime(),
            };
            setLogs((prevLogs) => [...prevLogs, newLog]);
        },
        [logs, setLogs],
    );
    return [logs, addToLogs];
}

export default function ClientContainer(props: ClientContainerProps) {
    const [logs, addToLogs] = useLogs();
    const [connected, setConnected] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [userId, setUserId] = useState('');
    const [tab, setTab] = useState('detail');

    const client = useMemo(() => {
        return props.client || new Client();
    }, [props.client]);

    const { gameTypes, roomTypes } = useGameAndRoomTypes(connected ? client : null);

    useEffect(() => {
        client.on(
            () => true,
            (data, messageType) => {
                addToLogs(messageType, data, 'server');
            },
        );
        client
            .connect()
            .then(() => {
                setConnected(true);
                if (client.isConnected) {
                    return client.login(props.username);
                }
            })
            .then((data) => {
                if (data) {
                    setLoggedIn(true);
                    setUserId(data.userId as string);
                }
            });
        return client.exit.bind(client);
    }, [client]);

    return (
        <Card
            tabList={tabList}
            activeTabKey={tab}
            onTabChange={setTab}
            title={`Player: ${props.username}`}
            style={{ width: 400, display: 'inline-block', margin: '5px', verticalAlign: 'top' }}
            extra={<Tag color="blue">{userId}</Tag>}
        >
            {connected && loggedIn && (
                <ClientContext.Provider
                    value={{
                        client,
                        userId,
                        username: props.username,
                        log: addToLogs,
                        gameTypes,
                        roomTypes,
                    }}
                >
                    <div style={{ display: tab === 'detail' ? 'block' : 'none' }}>
                        {props.children}
                        <CommandInput
                            suggestionProviders={providers}
                            expand
                            onRun={(json: any) => {
                                client.emit(json.messageType, json.data);
                            }}
                        />
                    </div>
                    <div style={{ display: tab === 'log' ? 'block' : 'none' }}>
                        <LogDisplay logs={logs} />
                    </div>
                </ClientContext.Provider>
            )}
        </Card>
    );
}

ClientContainer.ClientContextConsumer = ClientContext.Consumer;
