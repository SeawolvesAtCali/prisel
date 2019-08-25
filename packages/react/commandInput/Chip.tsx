import * as React from 'react';
import cn from '../utils/classname';
import './style.css';

export interface Suggestion {
    type: 'command' | 'param' | 'variableParam' | 'placeholderParam';
    label: string;
    value: any;
    providerKey: string;
}
interface ChipProps extends Suggestion {
    onClick?: (e: MouseEvent) => void;
    editMode?: boolean;
    onDelete?: (e: MouseEvent) => void;
}

const classNameForType: { [key in Suggestion['type']]: string } = {
    command: 'command',
    variableParam: 'param',
    param: 'param',
    placeholderParam: 'placeholder',
};

export function Chip(props: ChipProps) {
    const { type, label, editMode = false, onClick, onDelete } = props;
    const closeRef = React.useRef(null);
    const handleClick = React.useCallback(
        (e) => {
            if (e.target === closeRef.current && onDelete) {
                onDelete(e);
            } else if (onClick) {
                onClick(e);
            }
        },
        [onClick, onDelete],
    );

    const className = cn('command-input-chip', classNameForType[type], {
        highlight: editMode,
    });
    return (
        <span className={className} onClick={handleClick}>
            {label} <i ref={closeRef}>X</i>
        </span>
    );
}
