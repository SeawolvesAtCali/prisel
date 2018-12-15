import Client from '../client';
import { getCreateRoom } from '../message/room';

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
            title: 'create room',
            fields: [{ label: 'room name', key: 'roomName', type: Fields.TEXT, default: 'room-1' }],
            handler: (client: Client, fields: any) => {
                client.emit(...getCreateRoom(fields.roomName));
            },
        },
    ],
};

export default defaultProfile;
