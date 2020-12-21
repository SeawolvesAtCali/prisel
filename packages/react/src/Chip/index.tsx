import * as React from 'react';
import { Pill, Preset } from '../Pill';
import Suggestion from '../Suggestion';
import cn from '../utils/classname';
import styles from './index.module.css';

const classNameForType: { [key in Suggestion['type']]: Preset } = {
    command: Preset.PINK,
    variableParam: Preset.GREEN,
    param: Preset.GREEN,
    placeholderParam: Preset.WHITE,
};

interface DisplayProps extends Suggestion {
    onClick?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
    selectIndex?: number;
}

function Display(props: DisplayProps) {
    const { type, label, onClick, selectIndex } = props;
    const indexDisplay = selectIndex === undefined ? null : `${selectIndex}: `;

    return (
        <Pill
            preset={classNameForType[type]}
            className={cn(styles.chip, styles.display)}
            onClick={onClick}
        >
            {indexDisplay}
            {label}
        </Pill>
    );
}

interface EditProps extends Suggestion {
    editing: boolean;
    onClick?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
    onDelete?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
}

function Edit(props: EditProps) {
    const { type, label, onClick, onDelete, editing } = props;
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

    return (
        <Pill
            preset={classNameForType[type]}
            className={cn(styles.chip, { [styles.focus]: editing })}
            onClick={handleClick}
        >
            {label} <span ref={closeRef}>✖</span>
        </Pill>
    );
}

const Chip = {
    Edit,
    Display,
};

export default Chip;
