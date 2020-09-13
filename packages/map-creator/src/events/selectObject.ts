import { createArgEvent } from '@prisel/common';
import { GameObject } from '@prisel/monopoly-common';

export const selectObject = createArgEvent<GameObject>('SELECT_OBJECT');
