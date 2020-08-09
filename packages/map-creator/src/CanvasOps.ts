import { GameObject } from '@prisel/monopoly-common';

export interface CanvasOps {
    selectObject: (object: GameObject | undefined) => void;
}
