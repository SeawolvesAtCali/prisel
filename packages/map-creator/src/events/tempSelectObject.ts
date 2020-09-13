import { createArgEvent } from '@prisel/common';
import { GameObject } from '@prisel/monopoly-common';

export const tempSelectObject = createArgEvent<GameObject>('TEMP_SELECT_OBJECT');
