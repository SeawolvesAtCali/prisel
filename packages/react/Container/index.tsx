import React, { useContext } from 'react';
import styles from './index.css';
import Prompt from '../Prompt';
import LogPanel, { MessageWithMetaData } from '../LogPanel';
import run from '../commandInput/runCommand';
import Suggestion from '../Suggestion';

interface ContainerProps {
    onRun: (suggestions: Suggestion[], jsonObject: object) => void;
    logs: MessageWithMetaData[];
}

const Container: React.FC<ContainerProps> = ({ onRun, logs }) => {
    return (
        <div className={styles.Container}>
            <LogPanel messages={logs} />
            <Prompt
                onSubmit={(chips: Suggestion[]) => {
                    run(chips, (key) => {}, onRun);
                }}
            />
        </div>
    );
};

export default Container;
