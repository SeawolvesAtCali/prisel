import * as React from 'react';
import styles from './index.css';
import cn from '../utils/classname';
import Suggestion from '../Suggestion';

const classNameForType: { [key in Suggestion['type']]: string } = {
    command: styles.commandType,
    variableParam: styles.variableType,
    param: styles.paramType,
    placeholderParam: styles.placeholderType,
};

interface DisplayProps extends Suggestion {
    onClick?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
}

function Display(props: DisplayProps) {
    const { type, label, onClick } = props;
    return (
        <span className={cn(styles.chip, styles.display, classNameForType[type])} onClick={onClick}>
            {label}
        </span>
    );
}

interface EditProps extends Suggestion {
    onClick?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
    onDelete?: (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => void;
}

function Edit(props: EditProps) {
    const { type, label, onClick, onDelete } = props;
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
        <span
            className={cn(styles.chip, styles.edit, classNameForType[type])}
            onClick={handleClick}
        >
            {label} <span ref={closeRef}>✖</span>
        </span>
    );
}

export default {
    Edit,
    Display,
};
