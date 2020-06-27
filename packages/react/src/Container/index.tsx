import React from 'react';
import styles from './index.module.css';
import cn from '../utils/classname';

export interface BorderBox {
    displayBorder?: boolean;
}
interface ContainerProps extends BorderBox {
    children?: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ children, displayBorder }) => {
    return (
        <div className={cn(styles.Container, { [styles.displayBorder]: displayBorder })}>
            {children}
        </div>
    );
};

export default Container;
