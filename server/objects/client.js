// @flow

export type ClientT = {
    id: string,
    username: string,
    roomId?: string,
    type: 'controller' | 'display',
    isReady?: boolean,
};
