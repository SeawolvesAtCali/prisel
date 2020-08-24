import { ChanceInput, ChanceInputArgs, Mixins, Tile2 } from '@prisel/monopoly-common';
import React from 'react';
import { BooleanInput } from './BooleanInput';
import { ChanceEditor } from './ChanceEditor';
import { chanceInitializer } from './chanceInitializer';
import { Divider } from './Divider';
import { EnumInput } from './EnumInput';
import { ListEditor } from './ListEditor';
import styles from './TileEditor.module.css';

const chanceTypeSelectorMap: { [description: string]: keyof ChanceInputArgs } = {
    'please select': 'unspecified',
    'move to tile': 'move_to_tile',
    'cash exchange': 'cash_exchange',
    'move steps': 'move_steps',
    collectable: 'collectable',
};
interface TileEditorProps {
    tile: Tile2;
}
export const TileEditor: React.FC<TileEditorProps> = ({ tile }) => {
    const [hasChance, setHasChance] = React.useState(
        Mixins.hasMixin(tile, Mixins.ChancePoolMixinConfig),
    );

    const [newChanceType, setNewChanceType] = React.useState<keyof ChanceInputArgs>('unspecified');

    return (
        <div className={styles.container}>
            <BooleanInput
                autoFocus
                initialValue={tile.start}
                onCommit={(value) => {
                    if (value) {
                        tile.start = {};
                    } else {
                        delete tile.start;
                    }
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
            {hasChance && Mixins.hasMixin(tile, Mixins.ChancePoolMixinConfig) && (
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
