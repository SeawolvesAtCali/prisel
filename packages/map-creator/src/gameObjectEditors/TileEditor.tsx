import { Tile2 } from '@prisel/monopoly-common';
import React from 'react';
import { BooleanInput } from './BooleanInput';

interface TileEditorProps {
    tile: Tile2;
}
export const TileEditor: React.FC<TileEditorProps> = ({ tile }) => {
    return (
        <React.Fragment>
            <BooleanInput
                key={tile.id}
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
        </React.Fragment>
    );
};
