import {
    MoneyExchangeDirection,
    MoneyExchangeType,
    TileEffectInput,
    TileEffectInputArgs,
} from '@prisel/monopoly-common';
import { monopolypb } from '@prisel/protos';
import React from 'react';
import { BooleanInput } from './BooleanInput';
import { EnumInput } from './EnumInput';
import { NumberInput } from './NumberInput';
import { StringInput } from './StringInput';
import { TileSelectInput } from './TileSelectInput';

interface TileEffectEditorProps<T extends keyof TileEffectInputArgs> {
    autoFocus?: boolean;
    input: TileEffectInput<T>;
}

const MoveToTileTileEffectEditor: React.FC<TileEffectEditorProps<'move_to_tile'>> = ({
    input,
    autoFocus = false,
}) => {
    return (
        <React.Fragment>
            <TileSelectInput
                label="tile ID"
                autoFocus={autoFocus}
                tileId={input.inputArgs.tileId}
                onCommit={React.useCallback(
                    (tileId) => {
                        input.inputArgs.tileId = tileId;
                    },
                    [input],
                )}
            />
            <BooleanInput
                autoFocus={autoFocus}
                label="isTeleport"
                initialValue={input.inputArgs.isTeleport}
                onCommit={(value) => {
                    input.inputArgs.isTeleport = value;
                }}
            />
        </React.Fragment>
    );
};

export const MoneyExchangeTileEffectEditor: React.FC<TileEffectEditorProps<'money_exchange'>> = ({
    autoFocus = false,
    input,
}) => {
    return (
        <React.Fragment>
            <EnumInput
                label="cash exchange"
                initialValue={input.inputArgs.direction}
                autoFocus={autoFocus}
                enumMap={{
                    'to bank': MoneyExchangeDirection.TO_BANK,
                    'to all other players': MoneyExchangeDirection.TO_ALL_OTHER_PLAYERS,
                    'from bank': MoneyExchangeDirection.FROM_BANK,
                    'from all other players': MoneyExchangeDirection.FROM_ALL_OTHER_PLAYERS,
                }}
                onCommit={(direction: MoneyExchangeDirection) => {
                    input.inputArgs.direction = direction;
                }}
            />
            <EnumInput
                label="cash exchange type"
                initialValue={input.inputArgs.type}
                autoFocus={false}
                enumMap={{
                    default: MoneyExchangeType.DEFAULT,
                    'property tax': MoneyExchangeType.OWN_PROPERTY_PER_HUNDRED,
                }}
                onCommit={(exchangeType: MoneyExchangeType) => {
                    input.inputArgs.type = exchangeType;
                }}
            />
            <NumberInput
                label="amount"
                initialValue={input.inputArgs.amount}
                onCommit={(amount) => {
                    input.inputArgs.amount = amount;
                }}
            />
        </React.Fragment>
    );
};

const MoveStepsTileEffectEditor: React.FC<TileEffectEditorProps<'move_steps'>> = ({
    input,
    autoFocus = false,
}) => {
    return (
        <NumberInput
            label="steps"
            autoFocus={autoFocus}
            initialValue={input.inputArgs.steps}
            onCommit={(steps) => {
                input.inputArgs.steps = steps;
            }}
        />
    );
};

const CollectibleTileEffectEditor: React.FC<TileEffectEditorProps<'collectible'>> = ({
    input,
    autoFocus,
}) => {
    return (
        <EnumInput
            label="collectable"
            initialValue={input.inputArgs.type}
            autoFocus={autoFocus}
            enumMap={{
                'Get out of jail': monopolypb.CollectibleExtra_CollectibleType.GET_OUT_OF_JAIL_FREE,
            }}
            onCommit={(collectable: monopolypb.CollectibleExtra_CollectibleType) => {
                input.inputArgs.type = collectable;
            }}
        />
    );
};

const DetainedTileEffectEditor: React.FC<TileEffectEditorProps<'detained'>> = ({
    input,
    autoFocus,
}) => {
    return (
        <React.Fragment>
            <EnumInput
                label="Detained type"
                initialValue={input.inputArgs.type}
                autoFocus={autoFocus}
                enumMap={{
                    Arrested: monopolypb.DetainedExtra_Type.ARRESTED,
                    Hospitalized: monopolypb.DetainedExtra_Type.HOSPITALIZED,
                }}
                onCommit={(detainedType: monopolypb.DetainedExtra_Type) => {
                    input.inputArgs.type = detainedType;
                }}
            />
            <NumberInput
                label="turns"
                initialValue={input.inputArgs.length}
                onCommit={(amount) => {
                    input.inputArgs.length = amount;
                }}
            />
        </React.Fragment>
    );
};

export const TileEffectEditor: React.FC<TileEffectEditorProps<any>> = (props) => {
    let tileEffectEditor = null;
    let title = '';
    switch (props.input.type as keyof TileEffectInputArgs) {
        case 'move_to_tile':
            title = 'move to tile';
            tileEffectEditor = <MoveToTileTileEffectEditor {...props} />;
            break;
        case 'money_exchange':
            title = 'cash exchange';
            tileEffectEditor = <MoneyExchangeTileEffectEditor {...props} />;
            break;
        case 'move_steps':
            title = 'move steps';
            tileEffectEditor = <MoveStepsTileEffectEditor {...props} />;
            break;
        case 'collectible':
            title = 'collectible';
            tileEffectEditor = <CollectibleTileEffectEditor {...props} />;
            break;
        case 'detained':
            title = 'detained';
            tileEffectEditor = <DetainedTileEffectEditor {...props} />;
    }
    return (
        <React.Fragment>
            <p>{title}</p>
            <StringInput
                label="title"
                initialValue={props.input.display.title}
                onCommit={(value) => {
                    props.input.display.title = value;
                }}
            />
            <StringInput
                label="description"
                initialValue={props.input.display.description}
                onCommit={(value) => {
                    props.input.display.description = value;
                }}
            />
            {tileEffectEditor}
        </React.Fragment>
    );
};
