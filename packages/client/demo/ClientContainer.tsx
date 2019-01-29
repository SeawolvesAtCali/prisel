import * as React from 'react';
import pick from 'lodash/pick';
import { produce } from 'immer';
import { Card, InputNumber, Input, Button, Row, Col, Tag, Icon } from 'antd';
import { Profile, FieldType, Fields, ActionType } from './profile';
import Client, { AnyObject } from '../client';
import LoadingButton from './loadingButton';
import LogDisplay from './LogDisplay';

interface ClientContainerProps {
    profile: Profile;
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
    logs: Log[];
}>({
    client: undefined,
    userId: '',
    username: '',
    log: undefined,
    logs: [],
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
        const { profile } = this.props;
        const { actions } = profile;
        const actionTiles = actions.map(this.getActionTile.bind(this));
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
                            logs: this.state.logs,
                        }}
                    >
                        {tab === 'detail' && this.props.children}
                        {tab === 'log' && <LogDisplay />}
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

    private getField(field: FieldType) {
        const handleChange = (fieldKey: string, value: any) => {
            const nextState = produce(this.state, (draft) => {
                draft.fields[fieldKey] = value;
            });
            this.setState(nextState);
        };

        const input = (() => {
            switch (field.type) {
                case Fields.NUMBER:
                    return (
                        <InputNumber
                            onChange={(value: number) => handleChange(field.key, value)}
                            value={this.state.fields[field.key]}
                        />
                    );
                case Fields.TEXT:
                    return (
                        <Input
                            onChange={(event: any) => handleChange(field.key, event.target.value)}
                            value={this.state.fields[field.key]}
                        />
                    );
                case Fields.CUSTOM:
                    const Component = field.render;
                    return (
                        <Component
                            onChange={(value: number) => handleChange(field.key, value)}
                            onEvent={this.addOnEvent}
                            value={this.state.fields[field.key]}
                        />
                    );
            }
        })();
        return (
            <div key={field.key}>
                <Row
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <Col span={8}>{field.label}</Col>
                    <Col span={16}>{input}</Col>
                </Row>
            </div>
        );
    }

    private getResolvedFields(action: ActionType) {
        return pick(this.state.fields, (action.fields || []).map((field) => field.key));
    }

    private getActionTile(action: ActionType) {
        const fields = (action.fields || []).map(this.getField.bind(this));

        return (
            <div
                key={action.title}
                style={{
                    padding: '10px 0',
                }}
            >
                <h3
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    {action.title}
                    <LoadingButton
                        icon="caret-right"
                        onClick={() => action.handler(this.client, this.getResolvedFields(action))}
                    />
                </h3>
                {fields}
            </div>
        );
    }
}

export default ClientContainer;
