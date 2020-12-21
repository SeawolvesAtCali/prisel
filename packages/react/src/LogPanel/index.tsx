import { Packet } from '@prisel/client';
import debounce from 'lodash/debounce';
import * as React from 'react';
import Chip from '../Chip';
import { PacketView } from '../PacketView';
import Suggestion from '../Suggestion';
import cn from '../utils/classname';
import styles from './index.module.css';

export interface Message {
    packet: Packet;
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
    const { packet, defaultExpanded, origin, timestamp, command } = props;
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
            <PacketView packet={packet} fromServer={origin === 'server'} />
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

const AUTO_SCROLL_THRESHHOLD = 50;

function LogPanel({ messages }: LogPanelProps) {
    const containerRef = React.useRef<HTMLElement | null>(null);
    const [scrolledToBottom, setScrolledToBottom] = React.useState(true);
    const scrollToBottom = React.useCallback(() => {
        const container = containerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight - container.clientHeight;
        }
    }, [containerRef]);
    React.useEffect(() => {
        if (scrolledToBottom) {
            scrollToBottom();
        }
    }, [messages, scrollToBottom, scrolledToBottom]);
    const handleScroll = React.useMemo(
        () =>
            debounce(() => {
                const container = containerRef.current;
                if (!container) {
                    return;
                }
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
        [containerRef],
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
