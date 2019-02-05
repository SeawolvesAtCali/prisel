import * as React from 'react';
import { Collapse, Input, Icon, Select, Button, Tag } from 'antd';
import ClientContainer, { addToLog } from './ClientContainer';
import { Messages, MessageType, Client } from '@prisel/client';

const Panel = Collapse.Panel;

interface RoomManagerProps {
    roomInfo?: unknown;
    onJoinRoom?: () => void;
    gameTypes?: string[];
    roomTypes?: string[];
}

interface RoomManagerStates {
    roomInfo: unknown;
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

interface RoomInfo {
    id: string;
    name: string;
    host: string;
    players: string[];
    clientMap: any;
}

function isRoomInfo(roomInfo: unknown): roomInfo is RoomInfo {
    const assumeRoomInfo = roomInfo as RoomInfo;
    return assumeRoomInfo && 'name' in assumeRoomInfo && 'id' in assumeRoomInfo && 'host' in assumeRoomInfo;
}

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

    public handleCreateRoom = (client: Client, log: addToLog) => {
        this.listenToRoomUpdate(client);
        const [messageType, payload] = Messages.getCreateRoom(
            this.state.roomName,
            this.state.gameType || undefined,
            this.state.roomType || undefined,
        );
        client.emit(messageType, payload);
        log(messageType, payload, 'client');
    };

    public handleJoinRoom = (client: Client, log: addToLog) => {
        this.listenToRoomUpdate(client);
        const [messageType, payload] = Messages.getJoin(this.state.joinRoomId);
        client.emit(messageType, payload);
        log(messageType, payload, 'client');
    };

    public componentWillUnmount() {
        if (this.cancelListeningToRoomUpdate) {
            this.cancelListeningToRoomUpdate();
            this.cancelListeningToRoomUpdate = undefined;
        }
    }

    public render() {
        const { gameTypes = [], roomTypes = [] } = this.props;
        const { roomInfo, roomName, joinRoomId } = this.state;

        const PanelHeader = (
            <div>
                {isRoomInfo(roomInfo) && (
                    <h3 style={{ display: 'inline-block' }}>
                        <span style={{ marginRight: '10px' }}>Room: {roomInfo.name}</span>
                        <Tag color="blue">{roomInfo.id}</Tag>
                        {roomInfo.players.map((player: string) => (
                            <UserIcon isHost={player === roomInfo.host} key={player} />
                        ))}
                    </h3>
                )}
                {!roomInfo && <h3>Room</h3>}
            </div>
        );
        return (
            <Collapse bordered={false} defaultActiveKey={['1']} style={{ marginBottom: '10px' }}>
                <Panel
                    header={PanelHeader}
                    key="1"
                    style={{
                        background: '#f7f7f7',
                        borderRadius: 4,
                        border: 0,
                        overflow: 'hidden',
                    }}
                >
                    {isRoomInfo(roomInfo) && (
                        <React.Fragment>
                            {roomInfo.players.map((player: string) => (
                                <p key={player}>
                                    <UserIcon isHost={player === roomInfo.host} />
                                    <span
                                        style={{
                                            margin: '0 10px',
                                        }}
                                    >
                                        {roomInfo.clientMap[player].username}
                                    </span>
                                    <Tag color="blue">{player}</Tag>
                                </p>
                            ))}
                        </React.Fragment>
                    )}
                    {!roomInfo && (
                        <ClientContainer.ClientContextConsumer>
                            {({ client, log }) => (
                                <React.Fragment>
                                    <div>
                                        <h3>CreateRoom</h3>
                                        <Input.Group compact style={{ display: 'flex' }}>
                                            <Select
                                                style={{ flex: 1 }}
                                                onChange={this.handleGameTypeChange}
                                                placeholder="game"
                                                defaultValue={
                                                    gameTypes.length > 0 ? gameTypes[0] : undefined
                                                }
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
                                                placeholder="room"
                                                defaultValue={
                                                    roomTypes.length > 0 ? roomTypes[0] : undefined
                                                }
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
                                                onPressEnter={() =>
                                                    this.handleCreateRoom(client, log)
                                                }
                                            />
                                            <Button
                                                type="primary"
                                                icon="caret-right"
                                                onClick={() => this.handleCreateRoom(client, log)}
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
                                                onPressEnter={() =>
                                                    this.handleJoinRoom(client, log)
                                                }
                                                style={{ flex: 1 }}
                                            />
                                            <Button
                                                type="primary"
                                                icon="caret-right"
                                                onClick={() => this.handleJoinRoom(client, log)}
                                            />
                                        </Input.Group>
                                    </div>
                                </React.Fragment>
                            )}
                        </ClientContainer.ClientContextConsumer>
                    )}
                </Panel>
            </Collapse>
        );
    }
}

export default RoomManager;
