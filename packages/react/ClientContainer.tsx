import * as React from 'react';
import { produce } from 'immer';
import { Card, Tag } from 'antd';
import { Client } from '@prisel/client';
import LogDisplay, { Log } from './Log';

interface ClientContainerProps {
    username: string;
    client: Client;
}

interface ClientContainerStates {
    logs: Log[];
    connected: boolean;
    loggedIn: boolean;
    userId: string;
    tab: string;
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
}>({
    client: undefined,
    userId: '',
    username: '',
    log: undefined,
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
export default class ClientContainer extends React.Component<
    ClientContainerProps,
    ClientContainerStates
    > {
    public static ClientContextConsumer = ClientContext.Consumer;
    private client: Client;

    constructor(props: ClientContainerProps) {
        super(props);
        this.state = {
            logs: [],
            connected: false,
            loggedIn: false,
            userId: '',
            tab: 'detail',
        };
    }

    public componentDidMount() {
        if (this.props.client) {
            this.client = this.props.client;
        } else {
            this.client = new Client();
        }
        this.client.on(
            () => true,
            (data, messageType) => {
                this.setState(
                    produce(this.state, (draft) => {
                        draft.logs.push({
                            type: messageType,
                            payload: data,
                            origin: 'server',
                            timestamp: new Date().getTime(),
                        });
                    }),
                );
            },
        );

        this.client
            .connect()
            .then(() => {
                this.setState({
                    connected: true,
                });
                return this.client.login(this.props.username);
            })
            .then((data) => {
                this.setState({
                    loggedIn: true,
                    userId: data.userId as string,
                });
            });
    }

    public handleAddToLog = (
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
        this.setState({
            logs: this.state.logs.concat([newLog]),
        });
    };

    public render() {
        const { connected, loggedIn, tab } = this.state;

        return (
            <Card
                tabList={tabList}
                activeTabKey={tab}
                onTabChange={this.handleTabChange}
                title={`Player: ${this.props.username}`}
                style={{ width: 400, display: 'inline-block', margin: '5px', verticalAlign: 'top' }}
                extra={<Tag color="blue">{this.state.userId}</Tag>}
            >
                {connected && loggedIn && (
                    <ClientContext.Provider
                        value={{
                            client: this.client,
                            userId: this.state.userId,
                            username: this.props.username,
                            log: this.handleAddToLog,
                        }}
                    >
                        <div style={{ display: tab === 'detail' ? 'block' : 'none' }}>
                            {this.props.children}
                        </div>
                        <div style={{ display: tab === 'log' ? 'block' : 'none' }}>
                            <LogDisplay logs={this.state.logs} />
                        </div>
                    </ClientContext.Provider>
                )}
            </Card>
        );
    }

    private handleTabChange = (key: string) => {
        this.setState({
            tab: key,
        });
    };
}
