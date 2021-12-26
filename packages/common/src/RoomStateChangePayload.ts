import { priselpb } from '@prisel/protos';

export type RoomStateChangePayload = priselpb.RoomStateChangePayload;

class Builder {
    payload: Partial<priselpb.RoomStateChangePayload> = {};
    token?: priselpb.UpdateToken;

    public static forPlayerJoin(playerInfo: priselpb.PlayerInfo) {
        const builder = new Builder();
        builder.payload = {
            change: {
                oneofKind: 'playerJoin',
                playerJoin: playerInfo,
            },
        };
        return builder;
    }
    public static forPlayerLeave(playerId: string) {
        const builder = new Builder();
        builder.payload = {
            change: {
                oneofKind: 'playerLeave',
                playerLeave: playerId,
            },
        };
        return builder;
    }
    public static forHostLeave(hostId: string, newHostId: string) {
        const builder = new Builder();
        builder.payload = {
            change: {
                oneofKind: 'hostLeave',
                hostLeave: {
                    hostId,
                    newHostId,
                },
            },
        };
        return builder;
    }

    public setToken(token: priselpb.UpdateToken): Builder {
        this.token = token;
        return this;
    }

    public build(): priselpb.RoomStateChangePayload {
        if (this.payload.change === undefined) {
            throw new Error('RoomStateChangePayload should specifiy change');
        }
        return {
            change: this.payload.change,
            token: this.token,
        };
    }
}

export const RoomStateChangePayload = {
    forPlayerJoin: Builder.forPlayerJoin,
    forPlayerLeave: Builder.forPlayerLeave,
    forHostLeave: Builder.forHostLeave,
    isPlayerJoin(
        payload: priselpb.RoomStateChangePayload,
    ): payload is priselpb.RoomStateChangePayload & {
        change: { oneofKind: 'playerJoin' };
    } {
        return payload?.change?.oneofKind === 'playerJoin';
    },
    isPlayerLeave(
        payload: priselpb.RoomStateChangePayload,
    ): payload is priselpb.RoomStateChangePayload & {
        change: { oneofKind: 'playerLeave' };
    } {
        return payload?.change?.oneofKind === 'playerLeave';
    },
    isHostLeave(
        payload: priselpb.RoomStateChangePayload,
    ): payload is priselpb.RoomStateChangePayload & {
        change: { oneofKind: 'hostLeave' };
    } {
        return payload?.change?.oneofKind === 'hostLeave';
    },
    getJoinedPlayer(payload: priselpb.RoomStateChangePayload) {
        if (RoomStateChangePayload.isPlayerJoin(payload)) {
            return payload.change.playerJoin;
        }
    },
    getLeftPlayer(payload: priselpb.RoomStateChangePayload) {
        if (RoomStateChangePayload.isPlayerLeave(payload)) {
            return payload.change.playerLeave;
        }
    },
    getHostLeaveData(payload: priselpb.RoomStateChangePayload) {
        if (RoomStateChangePayload.isHostLeave(payload)) {
            return payload.change.hostLeave;
        }
    },
};
