import { Client, Packet } from '@prisel/client';
import { Action, Anim, exist } from '@prisel/monopoly-common';
import { animation_spec } from '../../../common/node_modules/@prisel/protos/dist';
import { animEmitter } from './animations';
import { client, ClientState } from './Client';
import { EVENT, EVENT_BUS } from './consts';
import { assertNever, lifecycle, nullCheck } from './utils';

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
        this.removeAnimationListener = this.client.on(Action.ANIMATION, (packet) => {
            const animationPayload = Packet.getPayload(packet, animation_spec.AnimationPayload);
            if (exist(animationPayload) && exist(animationPayload.animation)) {
                this.handleAnimation(animationPayload.animation);
            }
        });
    }

    @lifecycle
    protected onDestroy() {
        cc.log('remove animation');
        this.removeAnimationListener();
        animEmitter.removeAllListeners();
    }

    private handleAnimation(animation: animation_spec.Animation): Promise<unknown> {
        switch (animation.type) {
            case animation_spec.AnimationType.DEFAULT:
                cc.log('server animation ', animation.name, animation.length);
                this.eventBus.emit(EVENT.ANIMATION, animation);
                animEmitter.emit(animation.name, animation);
                return Anim.wait(animation).promise;
            case animation_spec.AnimationType.SEQUENCE:
                return (async () => {
                    for (const child of animation.children) {
                        await this.handleAnimation(child);
                    }
                })();
            case animation_spec.AnimationType.RACE:
                return Promise.race(animation.children.map(this.handleAnimation.bind(this)));
            case animation_spec.AnimationType.ALL:
                return Promise.all<void>(animation.children.map(this.handleAnimation.bind(this)));
            default:
                assertNever(animation.type);
        }
    }
}
