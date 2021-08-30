import { priselpb } from '@prisel/protos';
import * as flatbuffers from 'flatbuffers';
import { BufferBuilder } from './types';

export type RoomStateChangePayload = priselpb.RoomStateChangePayload;

class Builder {
    type = priselpb.RoomStateChangeInfo.NONE;
    playerJoinPlayerInfo: BufferBuilder = () => 0;
    playerLeavePlayerId: string = '';
    hostLeaveOldHostId: string = '';
    hostLeaveNewHostId: string = '';

    oldToken: string = '';
    newToken: string = '';

    public static forPlayerJoin(playerInfoBuilder: BufferBuilder) {
        const builder = new Builder();
        builder.type = priselpb.RoomStateChangeInfo.PlayerJoinInfo;
        builder.playerJoinPlayerInfo = playerInfoBuilder;
        return builder;
    }
    public static forPlayerLeave(playerId: string) {
        const builder = new Builder();
        builder.type = priselpb.RoomStateChangeInfo.PlayerLeaveInfo;
        builder.playerLeavePlayerId = playerId;
        return builder;
    }
    public static forHostLeave(hostId: string, newHostId: string) {
        const builder = new Builder();
        builder.type = priselpb.RoomStateChangeInfo.HostLeaveInfo;
        builder.hostLeaveOldHostId = hostId;
        builder.hostLeaveNewHostId = newHostId;
        return builder;
    }

    public setToken(oldToken: string, newToken: string): Builder {
        this.oldToken = oldToken;
        this.newToken = newToken;
        return this;
    }

    public build(): [Uint8Array, priselpb.RoomStateChangePayload] {
        const fbbuilder = new flatbuffers.Builder(1024);

        const updateTokenOffset = priselpb.UpdateToken.createUpdateToken(
            fbbuilder,
            fbbuilder.createString(this.oldToken),
            fbbuilder.createString(this.newToken),
        );

        switch (this.type) {
            case priselpb.RoomStateChangeInfo.PlayerJoinInfo:
                const playerJoinInfoOffset = priselpb.PlayerJoinInfo.createPlayerJoinInfo(
                    fbbuilder,
                    this.playerJoinPlayerInfo(fbbuilder),
                );
                priselpb.RoomStateChangePayload.startRoomStateChangePayload(fbbuilder);
                priselpb.RoomStateChangePayload.addChange(fbbuilder, playerJoinInfoOffset);
                break;
            case priselpb.RoomStateChangeInfo.PlayerLeaveInfo:
                const playerLeaveInfoOffset = priselpb.PlayerLeaveInfo.createPlayerLeaveInfo(
                    fbbuilder,
                    fbbuilder.createString(this.playerLeavePlayerId),
                );
                priselpb.RoomStateChangePayload.startRoomStateChangePayload(fbbuilder);
                priselpb.RoomStateChangePayload.addChange(fbbuilder, playerLeaveInfoOffset);
                break;
            case priselpb.RoomStateChangeInfo.HostLeaveInfo:
                const hostLeaveInfoOffset = priselpb.HostLeaveInfo.createHostLeaveInfo(
                    fbbuilder,
                    fbbuilder.createString(this.hostLeaveOldHostId),
                    fbbuilder.createString(this.hostLeaveOldHostId),
                );
                priselpb.RoomStateChangePayload.startRoomStateChangePayload(fbbuilder);
                priselpb.RoomStateChangePayload.addChange(fbbuilder, hostLeaveInfoOffset);
                break;
            default:
                // We will never get to this case.
                throw new Error('RoomStateChangePlayer type is not defined');
        }
        fbbuilder.finish(priselpb.RoomStateChangePayload.endRoomStateChangePayload(fbbuilder));
        const uint8Array = fbbuilder.asUint8Array();
        const payload = priselpb.RoomStateChangePayload.getRootAsRoomStateChangePayload(
            new flatbuffers.ByteBuffer(uint8Array),
        );
        return [uint8Array, payload];
    }
}

export const RoomStateChangePayload = {
    forPlayerJoin: Builder.forPlayerJoin,
    forPlayerLeave: Builder.forPlayerLeave,
    forHostLeave: Builder.forHostLeave,
    isPlayerJoin(
        payload: priselpb.RoomStateChangePayload,
    ): payload is priselpb.RoomStateChangePayload & {
        changeType: () => priselpb.RoomStateChangeInfo.PlayerJoinInfo;
    } {
        return payload.changeType() == priselpb.RoomStateChangeInfo.PlayerJoinInfo;
    },
    isPlayerLeave(
        payload: priselpb.RoomStateChangePayload,
    ): payload is priselpb.RoomStateChangePayload & {
        changeType: () => priselpb.RoomStateChangeInfo.PlayerLeaveInfo;
    } {
        return payload.changeType() == priselpb.RoomStateChangeInfo.PlayerLeaveInfo;
    },
    isHostLeave(
        payload: priselpb.RoomStateChangePayload,
    ): payload is priselpb.RoomStateChangePayload & {
        changeType: () => priselpb.RoomStateChangeInfo.HostLeaveInfo;
    } {
        return payload.changeType() == priselpb.RoomStateChangeInfo.HostLeaveInfo;
    },
    getJoinedPlayer(payload: priselpb.RoomStateChangePayload): priselpb.PlayerJoinInfo {
        if (RoomStateChangePayload.isPlayerJoin(payload)) {
            return payload.change(new priselpb.PlayerJoinInfo());
        }
        throw new Error('RoomStateChangePayload: Should check the union type first');
    },
    getLeftPlayer(payload: priselpb.RoomStateChangePayload): priselpb.PlayerLeaveInfo {
        if (RoomStateChangePayload.isPlayerLeave(payload)) {
            return payload.change(new priselpb.PlayerLeaveInfo());
        }
        throw new Error('RoomStateChangePayload: Should check the union type first');
    },
    getHostLeaveData(payload: priselpb.RoomStateChangePayload): priselpb.HostLeaveInfo {
        if (RoomStateChangePayload.isHostLeave(payload)) {
            return payload.change(new priselpb.HostLeaveInfo());
        }
        throw new Error('RoomStateChangePayload: Should check the union type first');
    },
};
