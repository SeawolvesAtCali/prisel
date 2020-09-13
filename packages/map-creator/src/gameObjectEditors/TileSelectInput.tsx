import React from 'react';
import { LayerType } from '../Layer';
import { useTempSelecting } from './useTempSelecting';

interface TileSelectInputProps {
    label: string;
    tileId: string;
    autoFocus?: boolean;
    onCommit?: (value: string) => unknown;
}

export const TileSelectInput: React.FC<TileSelectInputProps> = ({ label, tileId, onCommit }) => {
    const { isSelecting, startSelect, cancelSelect } = useTempSelecting(
        React.useCallback(
            (gameObject) => {
                if (gameObject && onCommit) {
                    onCommit(gameObject.id);
                }
            },
            [onCommit],
        ),
        LayerType.TILE,
        /* stopSelectingWhenSelected= */ true,
    );

    return (
        <div>
            {label}
            <button onClick={startSelect}>{tileId || 'select'}</button>
            {isSelecting && '...selecting'}
            {isSelecting && <button onClick={cancelSelect}>cancel</button>}
        </div>
    );
};
