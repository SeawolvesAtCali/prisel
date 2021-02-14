import { assertNever, Packet, Token } from '@prisel/common';
import { monopolypb, protobuf } from '@prisel/protos';
import type { IMessageType } from '@protobuf-ts/runtime';

type Animation = monopolypb.Animation;
type AnimationType = monopolypb.AnimationType;
const AnimationType = monopolypb.AnimationType;
// Utilities for working with animations
export class AnimationBuilder<ExtraType extends object = {}> implements Animation {
    private _name: string = 'unspecified';
    private _length: number = 0;
    private _type: AnimationType = AnimationType.DEFAULT;
    private _children: Animation[] = [];
    private _extra?: ExtraType = undefined;
    private _extraType?: IMessageType<ExtraType> = undefined;

    public get name() {
        return this._name;
    }
    public get length() {
        return this._length;
    }
    public get type() {
        return this._type;
    }
    public get children() {
        return this._children;
    }

    public get extra() {
        if (this._extra && this._extraType) {
            return protobuf.any.Any.pack(this._extra, this._extraType);
        }
    }

    public constructor(
        type: AnimationType = AnimationType.DEFAULT,
        extraMessageType?: IMessageType<ExtraType>,
    ) {
        this._type = type;
        if (extraMessageType) {
            this._extraType = extraMessageType;
        }
        if (
            this._type === AnimationType.RACE ||
            this._type === AnimationType.ALL ||
            this._type == AnimationType.SEQUENCE
        ) {
            this._children = [];
        }
    }
    public setName(name: string) {
        if (this._type === AnimationType.DEFAULT) {
            this._name = name;
        }
        return this;
    }
    public setLength(ms: number) {
        this._length = ms;
        return this;
    }
    public addChildren(...children: Animation[]) {
        if (Array.isArray(this._children)) {
            this._children = this._children.concat(children);
        }
        return this;
    }

    public setExtra(extra: ExtraType) {
        if (this._type === AnimationType.DEFAULT) {
            this._extra = extra;
        }
        return this;
    }
    public build(): Animation {
        const animation: Animation = {
            type: this._type,
            name: this._name,
            length: this._length,
            children: [],
        };
        const maybeExtra = this.extra;
        if (maybeExtra) {
            animation.extra = maybeExtra;
        }
        if (this._children.length > 0) {
            animation.children = this._children.map((child) =>
                child instanceof AnimationBuilder ? child.build() : child,
            );
        }

        Object.freeze(this);

        return animation;
    }
}

export const Anim = {
    // Create a single DEFAULT type animation
    create<ExtraType extends object = {}>(
        name: string,
        extraType?: IMessageType<ExtraType>,
    ): AnimationBuilder<ExtraType> {
        return new AnimationBuilder<ExtraType>(AnimationType.DEFAULT, extraType).setName(name);
    },
    getExtra<T extends object>(
        animation: monopolypb.Animation,
        extraType: IMessageType<T>,
    ): T | undefined {
        if (animation.extra && protobuf.any.Any.contains(animation.extra, extraType)) {
            return protobuf.any.Any.unpack(animation.extra, extraType);
        }
        return undefined;
    },
    all(...animations: Animation[]): Animation {
        return new AnimationBuilder(AnimationType.ALL).addChildren(...animations).build();
    },
    race(...animations: Animation[]): Animation {
        return new AnimationBuilder(AnimationType.RACE).addChildren(...animations).build();
    },
    sequence(...animations: Animation[]): Animation {
        return new AnimationBuilder(AnimationType.SEQUENCE).addChildren(...animations).build();
    },
    async wait(
        animation: Animation,
        {
            token,
            onStart,
        }: {
            onStart?: (packet: Packet) => void;
            token?: Token;
        } = {},
    ): Promise<void> {
        if (token?.cancelled) {
            return;
        }
        const waitTime = computeAnimationLength(animation);
        if (waitTime === Infinity) {
            throw new Error('cannot wait for infinite animation');
        }
        if (onStart) {
            onStart(toAnimationPacket(animation));
        }
        const timerToken = Token.delay(waitTime);
        if (token) {
            await Promise.race([timerToken.promise, token.promise]);
            timerToken.cancel();
        } else {
            await timerToken.promise;
        }
    },
};

function computeAnimationLength(animation: Animation): number {
    switch (animation.type) {
        case AnimationType.DEFAULT:
            return animation.length ?? 0;
        case AnimationType.ALL:
            return Math.max(...(animation?.children?.map(computeAnimationLength) ?? [0]));
        case AnimationType.RACE:
            return Math.min(...(animation?.children?.map(computeAnimationLength) ?? [0]));
        case AnimationType.SEQUENCE:
            return (
                animation?.children?.reduce(
                    (length: number, child: Animation) => length + computeAnimationLength(child),
                    0,
                ) ?? 0
            );
        default:
            assertNever(animation.type);
    }
}

export function toAnimationPacket(animation: Animation): Packet {
    return Packet.forAction('animation')
        .setPayload(monopolypb.AnimationPayload, {
            animation: animation instanceof AnimationBuilder ? animation.build() : animation,
        })
        .build();
}

function timeoutPromise(ms: number) {
    let cancel: () => void = () => {};
    const promise = new Promise<void>((resolve) => {
        const timeout = setTimeout(resolve, ms);
        cancel = () => {
            clearTimeout(timeout);
            resolve();
        };
    });
    const wrap = {
        promise,
        cancel,
    };
    return wrap;
}
