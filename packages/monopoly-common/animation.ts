import { Animation, AnimationType } from './types';
import { AnimationPayload, Action } from './messages';
import { PacketType, Packet } from '@prisel/common';

export const animationMap = {
    game_start: 1000,
    dice_roll: 1000,
    dice_down: 300,
    move: 500, // per tile
    focus_land: 100,
    invested: 1000,
    pan: 100, // per tile
    turn_start: 200,
    pay_rent: 1000,
};

export class AnimationBuilder implements Animation {
    private _name: keyof typeof animationMap;
    private _length: number = 0;
    private _forever: boolean = true;
    private _type: AnimationType = AnimationType.DEFAULT;
    private _children: Animation[];

    public get name() {
        return this._name || '';
    }
    public get length() {
        return this._length;
    }
    public get forever() {
        return this._forever;
    }
    public get type() {
        return this._type;
    }
    public get children() {
        return this._children;
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
    public setName(name: keyof typeof animationMap) {
        if (this._type === AnimationType.DEFAULT) {
            this._name = name;
        }
        return this;
    }
    public setLength(ms: number) {
        this._forever = false;
        this._length = ms;
        return this;
    }
    public setForever() {
        this._length = 0;
        this._forever = true;
        return this;
    }
    public addChildren(...children: Animation[]) {
        if (Array.isArray(this._children)) {
            this._children = this._children.concat(children);
        }
        return this;
    }
    public build(): Animation {
        const animation: Animation = {
            type: this._type,
            forever: this._forever,
            name: this._name,
            length: this._length,
        };
        if (this._children) {
            animation.children = this._children.map((child) =>
                child instanceof AnimationBuilder ? child.build() : child,
            );
        }

        Object.freeze(this);

        return animation;
    }
}

export const Anim = {
    create(name: keyof typeof animationMap): AnimationBuilder {
        return new AnimationBuilder(AnimationType.DEFAULT).setName(name);
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
            return animation.forever ? Infinity : animation.length;
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
