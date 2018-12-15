import Client from '../client';
import { getCreateRoom } from '../message/room';

export enum Action {
    MESSAGE,
    LOGIN,
    CONNECT,
}

export enum Fields {
    TEXT,
    NUMBER,
}

export interface FieldType {
    label: string;
    key: string;
    type: Fields;
    default?: any;
}

interface ResolvedFields {
    [fieldName: string]: any;
}

export interface ActionType {
    type: Action;
    title: string;
    fields?: FieldType[];
    handler: (client: Client, fields?: ResolvedFields) => Promise<any> | any;
}

export interface Profile {
    actions: ActionType[];
}

const defaultProfile: Profile = {
    actions: [
        {
            type: Action.CONNECT,
            title: 'connect',
            handler: async (client: Client) => {
                await client.connect();
                return 'connected';
            },
        },
        {
            type: Action.LOGIN,
            title: 'login',
            fields: [{ label: 'username', key: 'username', type: Fields.TEXT, default: 'batman' }],
            handler: (client: Client, fields: any) => {
                return client.login(fields.username);
            },
        },
        {
            type: Action.MESSAGE,
            title: 'create room',
            fields: [{ label: 'room name', key: 'roomName', type: Fields.TEXT, default: 'room-1' }],
            handler: (client: Client, fields: any) => {
                client.emit(...getCreateRoom(fields.roomName));
            },
        },
    ],
};

export default defaultProfile;
