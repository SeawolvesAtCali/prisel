import { player_info, room_state_change_spec, update_token } from '@prisel/protos';

export type RoomStateChangePayload = room_state_change_spec.RoomStateChangePayload;

class Builder {
    payload: Partial<room_state_change_spec.RoomStateChangePayload> = {};
    token?: update_token.UpdateToken;

    public static forPlayerJoin(playerInfo: player_info.PlayerInfo) {
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

    public setToken(token: update_token.UpdateToken): Builder {
        this.token = token;
        return this;
    }

    public build(): room_state_change_spec.RoomStateChangePayload {
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
        payload: room_state_change_spec.RoomStateChangePayload,
    ): payload is room_state_change_spec.RoomStateChangePayload & {
        change: { oneofKind: 'playerJoin' };
    } {
        return payload?.change?.oneofKind === 'playerJoin';
    },
    isPlayerLeave(
        payload: room_state_change_spec.RoomStateChangePayload,
    ): payload is room_state_change_spec.RoomStateChangePayload & {
        change: { oneofKind: 'playerLeave' };
    } {
        return payload?.change?.oneofKind === 'playerLeave';
    },
    isHostLeave(
        payload: room_state_change_spec.RoomStateChangePayload,
    ): payload is room_state_change_spec.RoomStateChangePayload & {
        change: { oneofKind: 'hostLeave' };
    } {
        return payload?.change?.oneofKind === 'hostLeave';
    },
    getJoinedPlayer(payload: room_state_change_spec.RoomStateChangePayload) {
        if (RoomStateChangePayload.isPlayerJoin(payload)) {
            return payload.change.playerJoin;
        }
    },
    getLeftPlayer(payload: room_state_change_spec.RoomStateChangePayload) {
        if (RoomStateChangePayload.isPlayerLeave(payload)) {
            return payload.change.playerLeave;
        }
    },
    getHostLeaveData(payload: room_state_change_spec.RoomStateChangePayload) {
        if (RoomStateChangePayload.isHostLeave(payload)) {
            return payload.change.hostLeave;
        }
    },
};
