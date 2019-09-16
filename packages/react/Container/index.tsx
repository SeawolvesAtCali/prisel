import React, { useContext } from 'react';
import styles from './index.css';
import cn from '../utils/classname';

interface ContainerProps {
    displayBorder?: boolean;
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
