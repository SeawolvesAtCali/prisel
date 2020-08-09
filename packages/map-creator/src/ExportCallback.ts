import { BoardSetup } from '@prisel/monopoly-common';

export interface ExportCallback {
    export: () => BoardSetup;
}
