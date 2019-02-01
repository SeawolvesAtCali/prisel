import * as React from 'react';
import pick from 'lodash/pick';
import { produce } from 'immer';
import { Card, InputNumber, Input, Row, Col, Tag } from 'antd';
import { Profile, FieldType, Fields, ActionType } from './profile';
import Client, { AnyObject } from '../client';
import LoadingButton from './loadingButton';
import LogDisplay from './LogDisplay';

interface ClientContainerProps {
    username: string;
}
export interface Log {
    type: string;
    payload: AnyObject;
    origin: 'server' | 'client' | 'none';
    timestamp: number;
}

interface ClientContainerStates {
    fields: any;
    logs: Log[];
    connected: boolean;
    loggedIn: boolean;
    userId: string;
    tab: string;
}

type offEvent = () => void;
type MessageWatcher = (messageType: string, data: any) => void;
export interface CustomFieldProps {
    onEvent: (handler: MessageWatcher) => offEvent;
    onChange: (value: any) => void;
    value: any;
}

export type addToLog = (
    messageType: string,
    payload: AnyObject,
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

export const ClientContextConsumer = ClientContext.Consumer;

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
class ClientContainer extends React.Component<ClientContainerProps, ClientContainerStates> {
    private static getResolvedFieldsFromProfile(profile: Profile) {
        const fields: any = {};
        profile.actions.forEach((action) =>
            (action.fields || []).forEach((field) => (fields[field.key] = field.default)),
        );
        return fields;
    }
    private client: Client;
    private messageWatchers = new Set<MessageWatcher>();

    constructor(props: any) {
        super(props);
        this.state = {
            fields: ClientContainer.getResolvedFieldsFromProfile(this.props.profile),
            logs: [],
            connected: false,
            loggedIn: false,
            userId: '',
            tab: 'detail',
        };
    }

    public componentDidMount() {
        this.client = new Client();
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
                this.messageWatchers.forEach((messageWatcher) => messageWatcher(messageType, data));
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
                    userId: data.userId,
                });
            });
    }

    public handleAddToLog = (
        type: string,
        payload: AnyObject = {},
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

    private addOnEvent = (handle: MessageWatcher) => {
        this.messageWatchers.add(handle);
        return () => {
            this.messageWatchers.delete(handle);
        };
    };
}

export default ClientContainer;
