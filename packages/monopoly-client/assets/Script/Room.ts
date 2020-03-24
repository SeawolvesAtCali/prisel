import { client } from './Client';
import { Client } from './packages/priselClient';
import PlayerInfo from './PlayerInfo';

const { ccclass, property } = cc._decorator;

interface PlayerInfoData {
    name: string;
    id: string;
    isHost: boolean;
    key: any;
}

const PLAYER_CARD_HEIGHT = 150;
@ccclass
export default class Room extends cc.Component {
    @property(cc.Prefab)
    public playerInfoPrefab: cc.Prefab = null;

    @property(cc.Node)
    public playersContainer: cc.Node = null;

    private playerDataList: PlayerInfoData[] = [];

    private client: Client;

    public onLoad() {
        this.client = client;
        // this is not fast enough, self data is already sent
        this.client.onRoomStateChange((roomStateChange) => {
            // consolidate playerDataList
            if (roomStateChange.newJoins) {
                for (const newJoin of roomStateChange.newJoins) {
                    const foundPlayer = this.playerDataList.find(
                        (playerInList) => playerInList.id === newJoin,
                    );
                    if (foundPlayer) {
                        // maybe update player if needed
                    } else {
                        this.playerDataList.push({
                            name: newJoin,
                            id: newJoin,
                            isHost: roomStateChange.newHost === newJoin,
                            key: newJoin,
                        });
                    }
                }
            }
            if (roomStateChange.newLeaves) {
                this.playerDataList = this.playerDataList.filter((playerInList) =>
                    roomStateChange.newLeaves.includes(playerInList.id),
                );
            }
            if (roomStateChange.newHost) {
                for (const playerInRoom of this.playerDataList) {
                    playerInRoom.isHost = playerInRoom.id === roomStateChange.newHost;
                }
            }

            if (this.node.active && this.enabled) {
                this.updatePlayerListUi();
            }
        });
    }

    public start() {
        cc.log('start');
        this.updatePlayerListUi();
    }

    private addPlayer(player: PlayerInfoData) {
        const playerInfo = cc.instantiate(this.playerInfoPrefab);
        this.playersContainer.addChild(playerInfo);
        playerInfo.getComponent(PlayerInfo).init(player.name, player.id);
        playerInfo.active = true;
        return playerInfo;
    }

    private updatePlayerListUi() {
        // remove all children
        cc.log('update ui');
        this.playersContainer.removeAllChildren();
        let height = 0;
        for (const player of this.playerDataList) {
            const playerInfo = this.addPlayer(player);
            playerInfo.y = height;
            playerInfo.x = 0;
            height = height - PLAYER_CARD_HEIGHT - 10;
            cc.log('added player at ' + playerInfo.x + ' ' + playerInfo.y);
        }
    }
}
