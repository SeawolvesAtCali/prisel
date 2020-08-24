import {
    CashExchangeDirection,
    ChanceInput,
    ChanceInputArgs,
    CollectableType,
} from '@prisel/monopoly-common';
import React from 'react';
import { EnumInput } from './EnumInput';
import { NumberInput } from './NumberInput';
import { StringInput } from './StringInput';

interface ChanceEditorProps<T extends keyof ChanceInputArgs> {
    autoFocus?: boolean;
    input: ChanceInput<T>;
}

const MoveToTileChanceEditor: React.FC<ChanceEditorProps<'move_to_tile'>> = ({
    input,
    autoFocus = false,
}) => {
    return (
        <StringInput
            label="tile ID"
            autoSelect={autoFocus}
            initialValue={input.inputArgs.tileId}
            onCommit={(tileId) => {
                input.inputArgs.tileId = tileId;
            }}
        />
    );
};

export const CashExchangeChanceEditor: React.FC<ChanceEditorProps<'cash_exchange'>> = ({
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
                    'to bank': CashExchangeDirection.TO_BANK,
                    'to all other players': CashExchangeDirection.TO_ALL_OTHER_PLAYERS,
                    'from bank': CashExchangeDirection.FROM_BANK,
                    'from all other players': CashExchangeDirection.FROM_ALL_OTHER_PLAYERS,
                }}
                onCommit={(direction: CashExchangeDirection) => {
                    input.inputArgs.direction = direction;
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

const MoveStepsChanceEditor: React.FC<ChanceEditorProps<'move_steps'>> = ({
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

const CollectableChanceEditor: React.FC<ChanceEditorProps<'collectable'>> = ({
    input,
    autoFocus,
}) => {
    return (
        <EnumInput
            label="collectable"
            initialValue={input.inputArgs.type}
            autoFocus={autoFocus}
            enumMap={{
                'Get out of jail': CollectableType.GET_OUT_OF_JAIL_FREE,
            }}
            onCommit={(collectable: CollectableType) => {
                input.inputArgs.type = collectable;
            }}
        />
    );
};

export const ChanceEditor: React.FC<ChanceEditorProps<any>> = (props) => {
    let chanceEditor = null;
    let title = '';
    switch (props.input.type) {
        case 'move_to_tile':
            title = 'move to tile';
            chanceEditor = <MoveToTileChanceEditor {...props} />;
            break;
        case 'cash_exchange':
            title = 'cash exchange';
            chanceEditor = <CashExchangeChanceEditor {...props} />;
            break;
        case 'move_steps':
            title = 'move steps';
            chanceEditor = <MoveStepsChanceEditor {...props} />;
            break;
        case 'collectable':
            title = 'collectable';
            chanceEditor = <CollectableChanceEditor {...props} />;
            break;
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
            {chanceEditor}
        </React.Fragment>
    );
};
