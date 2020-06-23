import React from 'react';
import styles from './index.module.css';
interface ToolbarProps {
    children?: React.ReactNode;
}
export function Toolbar({ children }: ToolbarProps) {
    return <section className={styles.Toolbar}>{children}</section>;
}

interface ToolbarItemProps {
    children?: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}
export function ToolbarItem({ children, onClick }: ToolbarItemProps) {
    return (
        <button className={styles.Item} onClick={onClick}>
            {children}
        </button>
    );
}
