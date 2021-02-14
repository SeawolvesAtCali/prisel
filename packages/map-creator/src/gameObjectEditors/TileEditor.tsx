import {
    ChanceInput,
    ChanceInputArgs,
    exist,
    Tile,
    TileEffectInputArgs,
} from '@prisel/monopoly-common';
import React from 'react';
import { BooleanInput } from './BooleanInput';
import { ChanceEditor } from './ChanceEditor';
import { chanceInitializer } from './chanceInitializer';
import { Divider } from './Divider';
import styles from './Editor.module.css';
import { EnumInput } from './EnumInput';
import { ListEditor } from './ListEditor';
import { TileEffectEditor } from './TileEffectEditor';
import { tileEffectInitializer } from './tileEffectInitializer';

const chanceTypeSelectorMap: { [description: string]: keyof ChanceInputArgs } = {
    'please select': 'unspecified',
    'move to tile': 'move_to_tile',
    'money exchange': 'money_exchange',
    'move steps': 'move_steps',
    collectible: 'collectible',
};

const tileEffectTypeSelectorMap: { [description: string]: keyof TileEffectInputArgs } = {
    'no effect': 'unspecified',
    'move to tile': 'move_to_tile',
    'money exchange': 'money_exchange',
    'move steps': 'move_steps',
    collectible: 'collectible',
    detained: 'detained',
};
interface TileEditorProps {
    tile: Tile;
}

const TileEffectSectionEditor: React.FC<TileEditorProps> = ({ tile }) => {
    const [newTileEffectType, setNewTileEffectType] = React.useState<keyof TileEffectInputArgs>(
        'unspecified',
    );

    return (
        <React.Fragment>
            <EnumInput
                label="tile effect type"
                initialValue={newTileEffectType}
                enumMap={tileEffectTypeSelectorMap}
                onCommit={(tileEffect) => {
                    setNewTileEffectType(tileEffect);
                    tile.tileEffect = tileEffectInitializer(tileEffect);
                    if (tile.tileEffect === undefined) {
                        delete tile.tileEffect;
                    }
                }}
            />
            {newTileEffectType !== 'unspecified' && tile.tileEffect && (
                <TileEffectEditor input={tile.tileEffect} />
            )}
        </React.Fragment>
    );
};

const ChanceSectionEditor: React.FC<TileEditorProps> = ({ tile }) => {
    const [hasChance, setHasChance] = React.useState(exist(tile.chancePool));

    const [newChanceType, setNewChanceType] = React.useState<keyof ChanceInputArgs>('unspecified');

    return (
        <React.Fragment>
            <BooleanInput
                initialValue={hasChance}
                label="hasChance"
                onCommit={(value) => {
                    setHasChance(value);
                    if (value) {
                        tile.chancePool = [];
                    } else {
                        delete tile.chancePool;
                    }
                }}
            />
            {hasChance && exist(tile.chancePool) && (
                <ListEditor
                    list={tile.chancePool}
                    itemRenderer={(item: ChanceInput<any>) => <ChanceEditor input={item} />}
                    itemInitializer={(onAddItem) => (
                        <div>
                            <EnumInput
                                label="chance type"
                                initialValue={newChanceType}
                                enumMap={chanceTypeSelectorMap}
                                onCommit={(chanceType) => {
                                    setNewChanceType(chanceType);
                                    const newChance = chanceInitializer(chanceType);
                                    if (newChance) {
                                        onAddItem(newChance);
                                    }
                                }}
                            />
                        </div>
                    )}
                />
            )}
        </React.Fragment>
    );
};
export const TileEditor: React.FC<TileEditorProps> = ({ tile }) => {
    return (
        <div className={styles.container}>
            <BooleanInput
                autoFocus
                label="start"
                initialValue={tile.isStart}
                onCommit={(value) => {
                    tile.isStart = value;
                }}
            />
            <Divider />
            <TileEffectSectionEditor tile={tile} />
            <Divider />
            <ChanceSectionEditor tile={tile} />
        </div>
    );
};
