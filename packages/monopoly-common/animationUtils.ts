import { AnimationType, Animation } from './types/index';
import { AnimationName, AnimationArgs } from './animationSpec';
import { Packet, PacketType } from '@prisel/common';
import { AnimationPayload, Action } from './messages';

// Utilities for working with animations
export class AnimationBuilder<ArgType = any> implements Animation {
    private _name: AnimationName = 'unspecified';
    private _length: number = 0;
    private _type: AnimationType = AnimationType.DEFAULT;
    private _children: Animation[];
    private _args: ArgType = undefined;

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

    public get args() {
        return this._args;
    }

    public constructor(type: AnimationType = AnimationType.DEFAULT) {
        this._type = type;
        if (
            this._type === AnimationType.RACE ||
            this._type === AnimationType.ALL ||
            this._type == AnimationType.SEQUENCE
        ) {
            this._children = [];
        }
    }
    public setName(name: AnimationName) {
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

    public setArgs(args: ArgType) {
        if (this._type === AnimationType.DEFAULT) {
            this._args = args;
        }
        return this;
    }
    public build(): Animation {
        const animation: Animation = {
            type: this._type,
            name: this._name,
            length: this._length,
        };
        if (this._args !== undefined && this._args !== null) {
            animation.args = this._args;
        }
        if (this._children) {
            animation.children = this._children.map((child) =>
                child instanceof AnimationBuilder ? child.build() : child,
            );
        }

        Object.freeze(this);

        return animation;
    }
}

type NoArgAnimation<_AnimationName extends AnimationName = AnimationName> = _AnimationName extends (
    AnimationArgs[_AnimationName] extends void ? _AnimationName : never
)
    ? _AnimationName
    : never;

type ArgedAnimation = Exclude<AnimationName, NoArgAnimation>;

interface CreateAnimation {
    create<_AnimationName extends NoArgAnimation = NoArgAnimation>(
        animationName: _AnimationName,
    ): AnimationBuilder<void>;
    create<_AnimationName extends ArgedAnimation = ArgedAnimation>(
        animationName: _AnimationName,
        arg: AnimationArgs[_AnimationName],
    ): AnimationBuilder<AnimationArgs[_AnimationName]>;
    [x: string]: any;
}

export const Anim: CreateAnimation = {
    create(name: AnimationName, args?: any) {
        const builder = new AnimationBuilder(AnimationType.DEFAULT).setName(name);
        if (args) {
            builder.setArgs(args);
        }
        return builder;
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
    processAndWait(processor: (packet: Packet<AnimationPayload>) => void, animation: Animation) {
        const packet = toAnimationPacket(animation);
        processor(packet);
        return Anim.wait(animation);
    },
    wait(
        animation: Animation,
    ): {
        promise: Promise<void>;
        cancel: () => void;
    } {
        const waitTime = computeAnimationLength(animation);
        if (waitTime === Infinity) {
            throw new Error('cannot wait for infinite animation');
        }
        return timeoutPromise(waitTime);
    },
};

function computeAnimationLength(animation: Animation): number {
    switch (animation.type) {
        case AnimationType.DEFAULT:
            return animation.length;
        case AnimationType.ALL:
            return Math.max(...animation.children.map(computeAnimationLength));
        case AnimationType.RACE:
            return Math.min(...animation.children.map(computeAnimationLength));
        case AnimationType.SEQUENCE:
            return animation.children.reduce(
                (length: number, child: Animation) => length + computeAnimationLength(child),
                0,
            );
    }
}

export function toAnimationPacket(animation: Animation): Packet<AnimationPayload> {
    return {
        type: PacketType.DEFAULT,
        action: Action.ANIMATION,
        payload: {
            animation: animation instanceof AnimationBuilder ? animation.build() : animation,
        },
    };
}

function timeoutPromise(ms: number) {
    let cancel: () => void;
    const wrap = {
        promise: new Promise<void>((resolve) => {
            const timeout = setTimeout(resolve, ms);
            cancel = () => {
                clearTimeout(timeout);
                resolve();
            };
        }),
        cancel,
    };
    return wrap;
}
