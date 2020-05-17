import { nullCheck } from './utils';
import { EVENT_BUS, EVENT } from './consts';
import { Rank } from './packages/monopolyCommon';
import RankView from './RankView';

const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Prefab)
    private rankPrefab: cc.Prefab = null;

    @property(cc.Node)
    private list: cc.Node = null;

    private eventBus: cc.Node = null;

    protected start() {
        nullCheck(this.rankPrefab);
        nullCheck(this.list);
        this.eventBus = nullCheck(cc.find(EVENT_BUS));
        this.eventBus.once(EVENT.SHOW_RANKING, this.showRanking, this);
        this.node.active = false;
    }

    private showRanking(ranks: Rank[]) {
        this.node.active = true;
        this.list.removeAllChildren();
        ranks.forEach((rank, index) => {
            const rankNode = cc.instantiate(this.rankPrefab);
            rankNode.getComponent(RankView).init(rank.player.name, rank.assets.cash, index);
            this.list.addChild(rankNode);
        });
        // display the ranking for 3 seconds, and then close
        this.scheduleOnce(this.closeView, 3);
    }

    private closeView() {
        this.eventBus.emit(EVENT.RANKING_CLOSED);
        this.node.active = false;
    }
}
