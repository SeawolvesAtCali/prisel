export enum ClientType {
    Controller = 'controller',
    Display = 'display',
}
export type ClientId = string;

export interface Client {
    id: ClientId;
    username: string;
    roomId?: string;
    type: ClientType;
    isReady?: boolean;
}
