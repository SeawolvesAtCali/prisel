import * as React from 'react';
import Suggestion from '../Suggestion';
import { MessageType } from '@prisel/client';
import styles from './index.css';
import cn from '../utils/classname';
import Chip from '../Chip';
import ReactJson from 'react-json-view';
import debounce from 'lodash/debounce';

export interface Message {
    type: MessageType;
    payload: { [prop: string]: unknown };
    command?: Suggestion[];
    origin: 'server' | 'client' | 'none';
}

const originClass = {
    server: styles.server,
    client: styles.client,
    none: styles.none,
};

export interface MessageWithMetaData extends Message {
    timestamp: number;
    defaultExpanded?: boolean;
}

const MessageDisplay: React.FC<MessageWithMetaData> = (props) => {
    const { payload, defaultExpanded, origin, timestamp, command } = props;
    const [expanded, setExpanded] = React.useState(
        defaultExpanded === undefined ? false : defaultExpanded,
    );
    const cachedTimestamp = React.useMemo(() => new Date(timestamp).toLocaleTimeString(), [
        timestamp,
    ]);

    return (
        <div className={styles.MessageDisplay} onClick={() => setExpanded(!expanded)}>
            <div className={styles.messageHeader}>
                <div className={styles.commandContainer}>
                    {command &&
                        command.map((chip) => (
                            <Chip.Display
                                key={chip.type}
                                label={chip.label}
                                type={chip.type}
                                value={chip.value}
                                providerKey={chip.providerKey}
                            />
                        ))}
                </div>
                <span className={styles.time}>{cachedTimestamp}</span>
                <span className={cn(styles.origin, originClass[origin])}>{origin}</span>
            </div>
            <ReactJson
                src={typeof payload !== 'object' ? { _primitive: payload } : payload}
                name="payload"
            />
        </div>
    );
};

export function createMessage(message: Message): MessageWithMetaData {
    return {
        ...message,
        timestamp: Date.now(),
        defaultExpanded: false,
    };
}

interface LogPanelProps {
    messages: MessageWithMetaData[];
}

interface LogPanelControl {
    scrollToBottom: () => void;
}

const AUTO_SCROLL_THRESHHOLD = 50;

function LogPanel({ messages }: LogPanelProps) {
    const containerRef = React.useRef(null);
    const [scrolledToBottom, setScrolledToBottom] = React.useState(true);
    const scrollToBottom = React.useCallback(() => {
        const container = containerRef.current;
        container.scrollTop = container.scrollHeight - container.clientHeight;
    }, []);
    React.useEffect(() => {
        if (scrolledToBottom) {
            scrollToBottom();
        }
    }, [messages]);
    const handleScroll = React.useMemo(
        () =>
            debounce(() => {
                const container = containerRef.current;
                if (
                    Math.abs(
                        container.scrollHeight - container.clientHeight - container.scrollTop,
                    ) < AUTO_SCROLL_THRESHHOLD
                ) {
                    setScrolledToBottom(true);
                } else {
                    setScrolledToBottom(false);
                }
            }),
        [],
    );

    return (
        <section className={styles.outerContainer}>
            {!scrolledToBottom && (
                <button className={styles.scrollButton} onClick={scrollToBottom}>
                    ↓
                </button>
            )}
            <section className={styles.Container} ref={containerRef} onScroll={handleScroll}>
                {messages.map((message) => (
                    <MessageDisplay {...message} key={message.timestamp} />
                ))}
            </section>
        </section>
    );
}

export default LogPanel;
