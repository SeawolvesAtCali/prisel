import * as React from 'react';
import pick from 'lodash/pick';
import { produce } from 'immer';
import { Card, InputNumber, Input, Button, Row, Col } from 'antd';
import { Profile, FieldType, Fields, ActionType } from './profile';
import Client from '../client';
import LoadingButton from './loadingButton';

interface ClientContainerProps {
    profile: Profile;
}
interface ClientContainerStates {
    fields: any;
    output: string[];
    connected: boolean;
    loggedIn: boolean;
}

function stringify(...rest: any[]): string {
    return rest
        .map((arg) =>
            arg === undefined ? 'undefined' : JSON.stringify([arg]).replace(/\[(.*)\]/, '$1'),
        )
        .join(', ');
}
type offEvent = () => void;
type MessageWatcher = (messageType: string, data: any) => void;
export interface CustomFieldProps {
    onEvent: (handler: MessageWatcher) => offEvent;
    onChange: (value: any) => void;
    value: any;
}
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
            output: [],
            connected: false,
            loggedIn: false,
        };
    }

    public componentDidMount() {
        this.client = new Client();
        this.client.on(
            () => true,
            (data, messageType) => {
                this.setState(
                    produce(this.state, (draft) => {
                        draft.output.push(stringify(messageType, data));
                    }),
                );
                this.messageWatchers.forEach((messageWatcher) => messageWatcher(messageType, data));
            },
        );

        this.client.connect().then(() => {
            this.setState({
                connected: true,
            });
        });
    }

    public render() {
        const { profile } = this.props;
        const { actions } = profile;
        const actionTiles = actions.map(this.getActionTile.bind(this));
        const { connected, loggedIn } = this.state;

        const loginBox = connected && !loggedIn && (
            <Input.Search
                placeholder="username"
                defaultValue="batman"
                onSearch={(value) =>
                    this.client.login(value).then(() => {
                        this.setState({
                            loggedIn: true,
                        });
                    })
                }
                enterButton="Login"
            />
        );

        return (
            <Card
                title="Client"
                style={{ width: 400, display: 'inline-block', margin: '5px', verticalAlign: 'top' }}
                extra={loginBox}
            >
                {connected && loggedIn && (
                    <React.Fragment>
                        {actionTiles}
                        <div
                            style={{
                                minHeight: '10px',
                                background: '#000066',
                                color: 'white',
                                wordBreak: 'break-all',
                                whiteSpace: 'normal',
                            }}
                        >
                            {this.state.output.map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                    </React.Fragment>
                )}
            </Card>
        );
    }

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
                    borderBottom: '1px solid lightgrey',
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
