export type ClientId = string;

export interface Client {
    id: ClientId;
    username: string;
    roomId?: string;
    isReady?: boolean;
}
