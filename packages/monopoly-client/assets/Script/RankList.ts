import { nullCheck } from './utils';
import { EVENT_BUS, EVENT } from './consts';
import { Rank } from './packages/monopolyCommon';
import RankView from './RankView';
import { setConfigs } from './components/configUtils';
import { WidgetConfig } from './components/WidgetConfig';
import { SpriteConfig } from './components/SpriteConfig';
import { NodeConfig } from './components/NodeConfig';
import { LabelConfig } from './components/LabelConfig';
import { LayoutConfig } from './components/LayoutConfig';
import SharedAssets from './SharedAssets';

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
        const root = NodeConfig.create().addComponents(WidgetConfig.fullSize());

        // background
        root.addChild()
            .setName('background')
            .addComponents(SpriteConfig.background(), WidgetConfig.fullSize());

        // rank label
        root.addChild()
            .setName('ranking label')
            .addComponents(LabelConfig.h1('RANKING'), WidgetConfig.centerTop(30));

        // rank list
        const rankListPath = root
            .addChild()
            .setName('ranking list')
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
