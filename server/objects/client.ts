export enum ClientType {
    Controller = 'controller',
    Display = 'display',
}

export interface Client {
    id: string;
    username: string;
    roomId?: string;
    type: ClientType;
    isReady?: boolean;
}
