import { genId } from '@prisel/monopoly-common';
import React from 'react';
export function useUniqueId() {
    const id = React.useMemo(genId, []);
    const [uniqueId] = React.useState(id);
    React.useDebugValue(id);
    return uniqueId;
}
