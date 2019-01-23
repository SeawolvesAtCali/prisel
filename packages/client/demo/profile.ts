import Client from '../client';
import { getCreateRoom, getJoin } from '../message/room';
import { getChat } from '../message/chat';
import { getGameStart, getMessage } from '../message';
export enum Fields {
    TEXT,
    NUMBER,
    CUSTOM,
}

export interface FieldType {
    label: string;
    key: string;
    type: Fields;
    default?: any;
    render?: any;
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
            title: 'gameStart',
            fields: [],
            handler: (client: Client, fields: any) => {
                client.emit(...getGameStart());
            },
        },
        {
            title: 'move(indies seperated by space)',
            fields: [{ label: 'position', key: 'index', type: Fields.TEXT }],
            handler: (client: Client, fields: any) => {
                client.emit(...getMessage({ cards: parseToArray(fields.index) }));
            },
        },
    ],
};

function parseToArray(data: string) {
    if (data === '') {
        return [];
    }
    const array = data.split(' ');
    return array.map(Number);
}
export default defaultProfile;
