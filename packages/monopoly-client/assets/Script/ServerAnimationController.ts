import { ClientState, client } from './Client';
import { Client, Packet } from './packages/priselClient';
import { nullCheck, lifecycle, assertNever } from './utils';
import {
    Action,
    AnimationPayload,
    Animation,
    AnimationType,
    Anim,
} from './packages/monopolyCommon';
import { EVENT_BUS, EVENT } from './consts';
import { animEmitter } from './animations';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ServerAnimationController extends cc.Component {
    private client: Client<ClientState>;
    private eventBus: cc.Node;
    private removeAnimationListener: () => void;

    @lifecycle
    protected onLoad() {
        this.client = nullCheck(client);
        this.eventBus = nullCheck(cc.find(EVENT_BUS));
    }

    @lifecycle
    protected start() {
        this.removeAnimationListener = this.client.on(
            Action.ANIMATION,
            (packet: Packet<AnimationPayload>) => {
                this.handleAnimation(packet.payload.animation);
            },
        );
    }

    @lifecycle
    protected onDestroy() {
        cc.log('remove animation');
        this.removeAnimationListener();
        animEmitter.removeAllListeners();
    }

    private handleAnimation(anim: Animation): Promise<unknown> {
        switch (anim.type) {
            case AnimationType.DEFAULT:
                cc.log('server animation ', anim.name, anim.length);
                this.eventBus.emit(EVENT.ANIMATION, anim);
                animEmitter.emit(anim.name, anim);
                return Anim.wait(anim).promise;
            case AnimationType.SEQUENCE:
                return (async () => {
                    for (const child of anim.children) {
                        await this.handleAnimation(child);
                    }
                })();
            case AnimationType.RACE:
                return Promise.race(anim.children.map(this.handleAnimation.bind(this)));
            case AnimationType.ALL:
                return Promise.all<void>(anim.children.map(this.handleAnimation.bind(this)));
            default:
                assertNever(anim.type);
        }
    }
}
