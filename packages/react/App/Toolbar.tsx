import React from 'react';
import styles from './toolbar.css';
interface ToolbarProps {
    children?: React.ReactNode;
}
function Toolbar({ children }: ToolbarProps) {
    return <section className={styles.Toolbar}>{children}</section>;
}

export default Toolbar;
