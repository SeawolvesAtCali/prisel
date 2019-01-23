import * as React from 'react';
import { Collapse, Input, Icon, Select, Button } from 'antd';
import { ClientContextConsumer } from './clientContainer';
import Client from '../client';
import { getCreateRoom, getJoin } from '../message';
import { MessageType } from '@prisel/common';

const Panel = Collapse.Panel;

interface RoomManagerProps {
    roomInfo?: any;
    onJoinRoom?: () => void;
    gameTypes?: string[];
    roomTypes?: string[];
}

interface RoomManagerStates {
    roomInfo: any;
    roomName: string;
    gameType: string;
    roomType: string;
    joinRoomId: string;
}
interface UserIconProps {
    isHost: boolean;
}

const UserIcon = ({ isHost }: UserIconProps) =>
    isHost ? (
        <Icon type="crown" style={{ color: 'goldenrod', fontSize: '1.17em' }} />
    ) : (
        <Icon type="user" style={{ fontSize: '1.17em' }} />
    );

class RoomManager extends React.Component<RoomManagerProps, RoomManagerStates> {
    private cancelListeningToRoomUpdate: () => void;

    constructor(props: RoomManagerProps) {
        super(props);
        this.state = {
            roomInfo: props.roomInfo,
            roomName: '',
            gameType: '',
            roomType: '',
            joinRoomId: '',
        };
    }

    public handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            roomName: e.currentTarget.value,
        });
    };

    public handleGameTypeChange = (gameType: string) => {
        this.setState({
            gameType,
        });
    };

    public handleRoomTypeChange = (roomType: string) => {
        this.setState({
            roomType,
        });
    };

    public handleJoinRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            joinRoomId: e.currentTarget.value,
        });
    };

    public listenToRoomUpdate(client: Client) {
        if (this.cancelListeningToRoomUpdate) {
            this.cancelListeningToRoomUpdate();
        }
        this.cancelListeningToRoomUpdate = client.on(MessageType.ROOM_UPDATE, (data) => {
            this.setState({
                roomInfo: data,
            });
        });
    }

    public handleCreateRoom = (client: Client) => {
        this.listenToRoomUpdate(client);
        client.emit(
            ...getCreateRoom(
                this.state.roomName,
                this.state.gameType || undefined,
                this.state.roomType || undefined,
            ),
        );
    };

    public handleJoinRoom = (client: Client) => {
        this.listenToRoomUpdate(client);
        client.emit(...getJoin(this.state.joinRoomId));
    };

    public componentWillUnmount() {
        if (this.cancelListeningToRoomUpdate) {
            this.cancelListeningToRoomUpdate();
            this.cancelListeningToRoomUpdate = undefined;
        }
    }

    public render() {
        const { gameTypes = [], roomTypes = [] } = this.props;
        const { roomInfo, roomName, roomType, gameType, joinRoomId } = this.state;

        const PanelHeader = (
            <div>
                {roomInfo && (
                    <React.Fragment>
                        <h3 style={{ display: 'inline-block' }}>
                            {` ${roomInfo.name} - ${roomInfo.id} `}
                            {roomInfo.players.map((player: string) => (
                                <UserIcon isHost={player === roomInfo.host} key={player} />
                            ))}
                        </h3>
                    </React.Fragment>
                )}
                {!roomInfo && <h3>Room Manager</h3>}
            </div>
        );
        return (
            <Collapse bordered={false} defaultActiveKey={['1']}>
                <Panel header={PanelHeader} key="1" showArrow={false}>
                    {roomInfo && (
                        <ClientContextConsumer>
                            {({ id }) => (
                                <React.Fragment>
                                    {roomInfo.players.map((player: string) => (
                                        <p key={player}>
                                            <UserIcon isHost={player === roomInfo.host} />
                                            <span
                                                style={{
                                                    border:
                                                        id === player ? '1px solid blue' : 'none',
                                                }}
                                            >
                                                {roomInfo.clientMap[player].username}
                                            </span>{' '}
                                            {player}{' '}
                                        </p>
                                    ))}
                                </React.Fragment>
                            )}
                        </ClientContextConsumer>
                    )}
                    {!roomInfo && (
                        <ClientContextConsumer>
                            {({ client }) => (
                                <React.Fragment>
                                    <div>
                                        <h3>CreateRoom</h3>
                                        <Input.Group compact style={{ display: 'flex' }}>
                                            <Select
                                                style={{ flex: 1 }}
                                                onChange={this.handleGameTypeChange}
                                                placeholder="game type"
                                            >
                                                {gameTypes.map((gameTypeOption: string) => (
                                                    <Select.Option
                                                        value={gameTypeOption}
                                                        key={gameTypeOption}
                                                    >
                                                        {gameTypeOption}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                            <Select
                                                style={{ flex: 1 }}
                                                onChange={this.handleRoomTypeChange}
                                                placeholder="room type"
                                            >
                                                {roomTypes.map((roomTypeOption) => (
                                                    <Select.Option
                                                        value={roomTypeOption}
                                                        key={roomTypeOption}
                                                    >
                                                        {roomTypeOption}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                            <Input
                                                placeholder="roomName"
                                                value={roomName}
                                                onChange={this.handleRoomNameChange}
                                                style={{ flex: 1 }}
                                                onPressEnter={() => this.handleCreateRoom(client)}
                                            />
                                            <Button
                                                type="primary"
                                                icon="caret-right"
                                                onClick={() => this.handleCreateRoom(client)}
                                            />
                                        </Input.Group>
                                    </div>
                                    <div>
                                        <h3>JoinRoom</h3>
                                        <Input.Group compact style={{ display: 'flex' }}>
                                            <Input
                                                placeholder="roomId"
                                                value={joinRoomId}
                                                onChange={this.handleJoinRoomIdChange}
                                                onPressEnter={() => this.handleJoinRoom(client)}
                                                style={{ flex: 1 }}
                                            />
                                            <Button
                                                type="primary"
                                                icon="caret-right"
                                                onClick={() => this.handleJoinRoom(client)}
                                            />
                                        </Input.Group>
                                    </div>
                                </React.Fragment>
                            )}
                        </ClientContextConsumer>
                    )}
                </Panel>
            </Collapse>
        );
    }
}

export default RoomManager;
