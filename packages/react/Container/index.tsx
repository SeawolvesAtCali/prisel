import * as React from 'react';
import styles from './index.css';
import Prompt from '../Prompt';

function Container(props) {
    return (
        <div className={styles.Container}>
            {' '}
            <Prompt />
        </div>
    );
}

export default Container;
