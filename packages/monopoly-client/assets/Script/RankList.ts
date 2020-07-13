import { Rank } from '@prisel/monopoly-common';
import { createDropShadow } from './components/DropShadow';
import { LabelConfig } from './components/LabelConfig';
import { LayoutConfig } from './components/LayoutConfig';
import { NodeConfig } from './components/NodeConfig';
import { WidgetConfig } from './components/WidgetConfig';
import { EVENT, EVENT_BUS } from './consts';
import RankView from './RankView';
import SharedAssets from './SharedAssets';
import { nullCheck } from './utils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class RankList extends cc.Component {
    private rankPrefab: cc.Prefab = null;
    private list: cc.Node = null;
    private eventBus: cc.Node = null;

    protected start() {
        this.rankPrefab = nullCheck(SharedAssets.instance().rankPrefab);
        this.eventBus = nullCheck(cc.find(EVENT_BUS));
        this.eventBus.once(EVENT.SHOW_RANKING, this.showRanking, this);

        this.render();
        this.node.active = false;
    }

    private render() {
        const root = NodeConfig.create(this.node.name).addComponents(WidgetConfig.fullSize());

        root.addAllChildren(createDropShadow()) // background
            .addChild('ranking label') // rank label
            .addComponents(LabelConfig.h1('RANKING'), WidgetConfig.horizontalCenter(30));

        // rank list
        const rankListPath = root
            .addChild('ranking list')
            .addComponents(
                LayoutConfig.verticalContainer(10),
                WidgetConfig.custom(100, 20, undefined, 20),
            )
            .getPath();
        root.apply(this.node);
        this.list = nullCheck(cc.find(rankListPath, this.node));
    }

    private showRanking(ranks: Rank[]) {
        this.node.active = true;
        this.list.removeAllChildren();
        ranks.forEach((rank, index) => {
            const rankNode = cc.instantiate(this.rankPrefab);
            rankNode.getComponent(RankView).init(rank.player.name, rank.assets.total, index);
            this.list.addChild(rankNode);
        });
        // display the ranking for 5 seconds, and then close
        this.scheduleOnce(this.closeView, 5);
    }

    private closeView() {
        this.eventBus.emit(EVENT.RANKING_CLOSED);
        this.node.active = false;
    }
}
