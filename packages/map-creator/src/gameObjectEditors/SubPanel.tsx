import React from 'react';
import styles from './SubPanel.module.css';

// a container to be used inside a panel

interface SubPanelProps {
    children: React.ReactNode;
}
export const SubPanel: React.FC<SubPanelProps> = ({ children }) => (
    <div className={styles.container}>{children}</div>
);
