import {
    assertExist,
    newRequestId,
    Packet,
    RequestBuilder,
    RequestManager,
    Response,
    Token,
} from '@prisel/common';
import { priselpb } from '@prisel/protos';
import WebSocket from 'ws';
import { emit } from './utils/networkUtils';

export type PlayerId = string;

const DEFAULT_REQUEST_TIMEOUT = 1000;

export interface Player {
    getRoomId(): string | null;
    setRoomId(roomId: string): void;
    clearRoomId(): void;
    getName(): string;
    getId(): PlayerId;
    getPlayerInfo(): priselpb.PlayerInfo;
    emit(packet: Packet): void;
    /**
     * Send a request to client
     * @param requestBuilder partial Request. no need to specify requstId as it will
     * be auto populated
     * @param token cancellationToken
     */
    request(requestBuilder: RequestBuilder, callback: (response: Response) => unknown): void;
    request(requestBuilder: RequestBuilder, token?: Token): Promise<Response>;
    respond(response: Response): void;
    getSocket(): WebSocket;
    equals(player: Player | undefined): boolean;
}

export interface PlayerOption {
    name: string;
    id: string;
    getSocket: () => WebSocket | undefined;
    requests: RequestManager;
}
/* tslint:disable: max-classes-per-file*/
class PlayerImpl implements Player {
    private roomId: string | null = null;
    private id: string;
    private name: string;
    private getSocketNullable: () => WebSocket | undefined;
    private requests: RequestManager;
    constructor(config: PlayerOption) {
        const { name, id, getSocket, requests } = config;
        this.getSocketNullable = getSocket;
        this.id = id;
        this.name = name;
        this.requests = requests;
    }

    public setRoomId(roomId: string): void {
        this.roomId = roomId;
    }

    public getRoomId(): string | null {
        return this.roomId;
    }

    public clearRoomId() {
        this.roomId = null;
    }

    public getSocket(): WebSocket {
        return assertExist(this.getSocketNullable());
    }

    public getName() {
        return this.name;
    }

    public getId() {
        return this.id;
    }
    public getPlayerInfo() {
        return {
            name: this.name,
            id: this.id,
        };
    }

    public emit(packet: Packet) {
        setImmediate(emit, this.getSocket(), packet);
    }

    public request(requestBuilder: RequestBuilder, callback: (response: Response) => unknown): void;
    public request(requestBuilder: RequestBuilder, token?: Token): Promise<Response>;
    public request(
        requestBuilder: RequestBuilder,
        token: Token | ((response: Response) => unknown) = Token.delay(DEFAULT_REQUEST_TIMEOUT),
    ) {
        const fullRequest = requestBuilder.setId(newRequestId()).build();
        this.emit(fullRequest);
        if (!token || token instanceof Token) {
            return this.requests.addRequest(fullRequest, token).catch((error) => {
                // possible timeout error
                return Response.forRequest(fullRequest).setFailure(error.message).build();
            });
        }

        return this.requests.addRequest(fullRequest, token);
    }

    public respond(response: Response) {
        this.emit(response);
    }
    public equals(player: Player): boolean {
        if (!player) {
            return false;
        }
        return this.getId() === player.getId();
    }
}

export function newPlayer(config: PlayerOption): Player {
    const player = new PlayerImpl(config);
    return player;
}
