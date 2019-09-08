import React, { useState, useMemo, useEffect } from 'react';
import { Client, MessageType, Messages } from '@prisel/client';
import { Message } from '../LogPanel';
import { isFeedback } from '@prisel/common';

export type AddToLogs = (message: Message) => void;
export interface ClientState {
    username: string;
    connecting: boolean;
    loggingIn: boolean;
    loggedIn: boolean;
    userId: string;
}

export async function createClient(username: string, addToLogs: AddToLogs) {
    const client = new Client<ClientState>();
    client.setState({ username, connecting: false, loggingIn: false, loggedIn: false });
    client.on(
        () => true,
        (data, messageType) => {
            addToLogs({ type: messageType, payload: data, origin: 'server' });
        },
    );
    client.onEmit(
        // When type is MESSAGE, let Prompt handle adding to log
        (messageType) => messageType !== MessageType.MESSAGE,
        (data, messageType) => {
            addToLogs({ type: messageType, payload: data, origin: 'client' });
        },
    );
    return client;
}

export async function connect(client: Client<ClientState>) {
    if (client.isConnected || client.state.connecting) {
        return client;
    }
    client.setState({
        connecting: true,
    });
    await client.connect();

    if (client.isConnected) {
        client.setState({ connecting: false });
        return client;
    }
    throw new Error('client cannot connect');
}

export async function login(client: Client<ClientState>) {
    if (!client.isConnected || client.state.loggingIn || client.state.userId) {
        return Promise.resolve(client);
    }
    const username = (client.state.username as string) || 'unnamed';

    const data = await client.login(username);

    if (data) {
        client.setState({
            loggingIn: false,
            userId: data.userId as string,
        });
        return client;
    }
    throw new Error('client cannot login');
}

export async function getGameAndRoomTypes(client: Client<ClientState>) {
    if (!client.isConnected) {
        throw new Error('cannot get game and room types is not connected');
    }
    const promise = client.once(
        (messageType, data) =>
            messageType === MessageType.SUCCESS &&
            isFeedback(data) &&
            data.action === MessageType.GET_GAME_AND_ROOM_TYPES,
    );
    client.emit(...Messages.getGameAndRoomType());

    const response = await promise;
    return {
        gameTypes: response.gameTypes as string[],
        roomTypes: response.roomTypes as string[],
    };
}

export async function createRoom(client: Client<ClientState>, gameType: string, roomType: string) {
    const promise = client.once(
        (messageType, data) =>
            messageType === MessageType.SUCCESS &&
            isFeedback(data) &&
            data.action === MessageType.CREATE_ROOM,
    );
    client.emit(...Messages.getCreateRoom('Room', gameType, roomType));
    const { roomId } = await promise;
    return roomId as string;
}

export async function joinRoom(client: Client<ClientState>, roomId: string) {
    const promise = client.once(
        (messageType, data) =>
            messageType === MessageType.SUCCESS &&
            isFeedback(data) &&
            data.action === MessageType.JOIN,
    );
    await client.emit(...Messages.getJoin(roomId));
}
