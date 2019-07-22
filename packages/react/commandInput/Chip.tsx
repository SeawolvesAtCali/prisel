import * as React from 'react';
import 'style.css';

export interface Suggestion {
    type: 'command' | 'param' | 'variableParam';
    label: string;
    value: any;
}

export function ChipEdit(props: Suggestion) {
    const { type, label, value } = props;

    switch (type) {
        case 'command':
            return <span className="command-input-chip-edit command">{label}</span>;
        case 'variableParam':
        case 'param':
            return <span className="command-input-chip-edit param">{label}</span>;
        default:
            return null;
    }
}
