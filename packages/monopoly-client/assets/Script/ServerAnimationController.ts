import { assertExist, Client, Packet } from '@prisel/client';
import { Action, Anim, exist } from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import { animEmitter } from './animations';
import { client, ClientState } from './Client';
import { EVENT, EVENT_BUS } from './consts';
import { assertNever, lifecycle } from './utils';

const { ccclass, property } = cc._decorator;

@ccclass
export default class ServerAnimationController extends cc.Component {
    private client: Client<ClientState> = client;
    private eventBus?: cc.Node;
    private removeAnimationListener?: () => void;

    @lifecycle
    protected onLoad() {
        this.eventBus = assertExist(cc.find(EVENT_BUS));
    }

    @lifecycle
    protected start() {
        this.removeAnimationListener = this.client.on(Action.ANIMATION, (packet) => {
            const animationPayload = Packet.getPayload(packet, monopolypb.AnimationPayload);
            if (exist(animationPayload) && exist(animationPayload.animation)) {
                this.handleAnimation(animationPayload.animation);
            }
        });
    }

    @lifecycle
    protected onDestroy() {
        cc.log('remove animation');
        if (this.removeAnimationListener) {
            this.removeAnimationListener();
        }
        animEmitter.removeAllListeners();
    }

    private handleAnimation(animation: monopolypb.Animation): Promise<unknown> {
        switch (animation.type) {
            case monopolypb.AnimationType.DEFAULT:
                cc.log('server animation ', animation.name, animation.length);
                this.eventBus?.emit(EVENT.ANIMATION, animation);
                animEmitter.emit(animation.name, animation);
                return Anim.wait(animation);
            case monopolypb.AnimationType.SEQUENCE:
                return (async () => {
                    for (const child of animation.children) {
                        await this.handleAnimation(child);
                    }
                })();
            case monopolypb.AnimationType.RACE:
                return Promise.race(animation.children.map(this.handleAnimation.bind(this)));
            case monopolypb.AnimationType.ALL:
                return Promise.all<unknown>(
                    animation.children.map(this.handleAnimation.bind(this)),
                );
            default:
                assertNever(animation.type);
        }
    }
}
