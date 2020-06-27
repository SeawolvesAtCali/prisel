import * as React from 'react';
import styles from './index.module.css';
import cn from '../utils/classname';

export enum Preset {
    DEFAULT,
    PINK,
    GREEN,
    WHITE,
}

interface PillProps {
    preset?: Preset;
    children: React.ReactNode;
    [x: string]: any;
}

interface Style {
    color: string;
    background: string;
    borderColor: string;
}

const colors: Record<Preset, Style> = {
    [Preset.DEFAULT]: {
        background: '#fbfffc',
        borderColor: '#c8e6c9',
        color: '#97b498',
    },
    [Preset.GREEN]: {
        background: '#fbfffc',
        borderColor: '#c8e6c9',
        color: '#97b498',
    },
    [Preset.PINK]: {
        background: '#ffeeff',
        borderColor: '#f8bbd0',
        color: '#c48b9f',
    },
    [Preset.WHITE]: {
        background: 'white',
        borderColor: 'lightgrey',
        color: 'grey',
    },
};

export const Pill: React.FC<PillProps> = (props) => {
    const { preset = Preset.DEFAULT, children, className, ...rest } = props;
    const finalClassName = className ? cn(styles.pill, className) : styles.pill;

    return (
        <span className={finalClassName} style={colors[preset]} {...rest}>
            {props.children}
        </span>
    );
};
