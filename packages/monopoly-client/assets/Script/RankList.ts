import { assertExist } from '@prisel/client';
import { monopolypb } from '@prisel/protos';
import { createDropShadow } from './components/DropShadow';
import { LabelConfig } from './components/LabelConfig';
import { LayoutConfig } from './components/LayoutConfig';
import { NodeConfig } from './components/NodeConfig';
import { WidgetConfig } from './components/WidgetConfig';
import { EVENT, EVENT_BUS } from './consts';
import RankView from './RankView';
import SharedAssets from './SharedAssets';

const { ccclass, property } = cc._decorator;

@ccclass
export default class RankList extends cc.Component {
    private rankPrefab?: cc.Prefab;
    private list?: cc.Node;
    private eventBus?: cc.Node;

    protected start() {
        this.rankPrefab = assertExist(SharedAssets.instance().rankPrefab);
        this.eventBus = assertExist(cc.find(EVENT_BUS));
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
                LayoutConfig.verticalWrapChildren(10),
                WidgetConfig.custom(100, 20, undefined, 20),
            )
            .getPath();
        root.apply(this.node);
        this.list = assertExist(cc.find(rankListPath, this.node));
    }

    private showRanking(ranks: monopolypb.Rank[]) {
        this.node.active = true;
        this.list?.removeAllChildren();
        ranks.forEach((rank, index) => {
            const rankNode = (cc.instantiate(this.rankPrefab) as unknown) as cc.Node;
            rankNode
                .getComponent(RankView)
                .init(rank.player?.id || 'player', rank.asset?.total || 0, index);
            this.list?.addChild(rankNode);
        });
        // display the ranking for 5 seconds, and then close
        this.scheduleOnce(this.closeView, 5);
    }

    private closeView() {
        this.eventBus?.emit(EVENT.RANKING_CLOSED);
        this.node.active = false;
    }
}
