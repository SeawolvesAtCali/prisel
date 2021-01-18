import { ChanceInput, ChanceInputArgs, exist, Tile } from '@prisel/monopoly-common';
import React from 'react';
import { BooleanInput } from './BooleanInput';
import { ChanceEditor } from './ChanceEditor';
import { chanceInitializer } from './chanceInitializer';
import { Divider } from './Divider';
import styles from './Editor.module.css';
import { EnumInput } from './EnumInput';
import { ListEditor } from './ListEditor';

const chanceTypeSelectorMap: { [description: string]: keyof ChanceInputArgs } = {
    'please select': 'unspecified',
    'move to tile': 'move_to_tile',
    'money exchange': 'money_exchange',
    'move steps': 'move_steps',
    collectible: 'collectible',
};
interface TileEditorProps {
    tile: Tile;
}
export const TileEditor: React.FC<TileEditorProps> = ({ tile }) => {
    const [hasChance, setHasChance] = React.useState(exist(tile.chancePool));

    const [newChanceType, setNewChanceType] = React.useState<keyof ChanceInputArgs>('unspecified');

    return (
        <div className={styles.container}>
            <BooleanInput
                autoFocus
                initialValue={tile.isStart}
                onCommit={(value) => {
                    tile.isStart = value;
                }}
            >
                start
            </BooleanInput>
            <Divider />
            <BooleanInput
                initialValue={hasChance}
                onCommit={(value) => {
                    setHasChance(value);
                    if (value) {
                        tile.chancePool = [];
                    } else {
                        delete tile.chancePool;
                    }
                }}
            >
                hasChance
            </BooleanInput>
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
                                onCommit={setNewChanceType}
                            />
                            {newChanceType !== 'unspecified' && (
                                <button
                                    onClick={() => {
                                        const newChance = chanceInitializer(newChanceType);
                                        if (newChance) {
                                            onAddItem(newChance);
                                        }
                                    }}
                                >
                                    add
                                </button>
                            )}
                        </div>
                    )}
                />
            )}
        </div>
    );
};
