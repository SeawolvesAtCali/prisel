import Client from '../client';
import { getCreateRoom, getJoin } from '../message/room';
import { getChat } from '../message/chat';
import { getGameStart, getMove } from '../message';

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
        {
            title: 'join',
            fields: [{ label: 'room id', key: 'roomid', type: Fields.TEXT, default: 'ROOM-1' }],
            handler: (client: Client, fields: any) => {
                client.emit(...getJoin(fields.roomid));
            },
        },
        {
            title: 'send',
            fields: [
                { label: '', key: 'msg', type: Fields.TEXT },
                { label: 'user id', key: 'uid', type: Fields.TEXT },
                { label: 'room id', key: 'rid', type: Fields.TEXT },
            ],
            handler: (client: Client, fields: any) => {
                client.emit(...getChat(fields.uid, fields.msg, fields.rid));
            },
        },
        {
            title: 'gameStart',
            fields: [],
            handler: (client: Client, fields: any) => {
                client.emit(...getGameStart());
            },
        },
        {
            title: 'enter indies of cards you want to play, sperated by space',
            fields: [{ label: 'position', key: 'index', type: Fields.TEXT }],
            handler: (client: Client, fields: any) => {
                client.emit(...getMove({ cards: parseToArray(fields.index) }));
            },
        },
    ],
};

function parseToArray(data: string) {
    if (data === '') {
        return [];
    }
    const array = data.split(' ');
    const output = [];
    for (const str of array) {
        output.push(Number(str));
    }
    return output;
}
export default defaultProfile;
