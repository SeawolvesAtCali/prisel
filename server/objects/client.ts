export enum ClientType {
    Controller = 'controller',
    Display = 'display',
}

export type Client = {
    id: string;
    username: string;
    roomId?: string;
    type: ClientType;
    isReady?: boolean;
};
