import { GameObject } from '@prisel/monopoly-common';
import React from 'react';
import { AppContext } from '../AppContext';
import { tempSelectObject } from '../events';
import { LayerType } from '../Layer';
import { useMutable } from '../useMutable';
import { useUniqueId } from '../useUniqueId';
import { useTypedEvent } from './useTypedEvent';

export function useTempSelecting(
    onSelect: (object: GameObject | undefined) => unknown,
    layer: LayerType,
    stopSelectingWhenSelected = true,
) {
    const context = React.useContext(AppContext);
    const uniqueId = useUniqueId();
    const isSelecting = context?.tempSelectingConfig?.fieldId === uniqueId;
    const setTempSelectingRef = useMutable(context?.setTempSelecting);

    const onSelectRef = useMutable(onSelect);

    const startSelect = React.useCallback(() => {
        if (!isSelecting && setTempSelectingRef.current) {
            setTempSelectingRef.current({
                fieldId: uniqueId,
                layer,
            });
        }
    }, [isSelecting, uniqueId, setTempSelectingRef, layer]);

    const cancelSelect = React.useCallback(() => {
        if (isSelecting && setTempSelectingRef.current) {
            setTempSelectingRef.current(undefined);
        }
    }, [isSelecting, setTempSelectingRef]);

    useTypedEvent(
        tempSelectObject,
        React.useCallback(
            (gameObject: GameObject) => {
                if (isSelecting) {
                    onSelectRef.current(gameObject);
                    if (stopSelectingWhenSelected && setTempSelectingRef.current) {
                        setTempSelectingRef.current(undefined);
                    }
                }
            },
            [isSelecting, onSelectRef, setTempSelectingRef, stopSelectingWhenSelected],
        ),
    );

    return { isSelecting, startSelect, cancelSelect };
}
