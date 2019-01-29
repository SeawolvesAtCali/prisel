import * as React from 'react';
import { ClientContextConsumer, Log } from './ClientContainer';
import { Tag, List } from 'antd';
import ReactJson from 'react-json-view';

interface LogDisplayProps {
    logs: Log[];
}

class LogDisplay extends React.Component<LogDisplayProps> {
    public render() {
        const { logs = [] } = this.props;
        return (
            <List
                itemLayout="vertical"
                dataSource={logs.slice().reverse()}
                bordered
                renderItem={(log: Log) => {
                    const timeString = new Date(log.timestamp).toLocaleTimeString();
                    return (
                        <List.Item>
                            <List.Item.Meta
                                title={
                                    <div
                                        style={{
                                            display: 'flex',
                                        }}
                                    >
                                        <span
                                            style={{
                                                marginRight: '10px',
                                                verticalAlign: 'bottom',
                                            }}
                                        >
                                            {log.type}
                                        </span>
                                        <Tag>{log.origin}</Tag>
                                        <span
                                            style={{
                                                flex: 1,
                                                textAlign: 'end',
                                                fontWeight: 'normal',
                                            }}
                                        >
                                            {timeString}
                                        </span>
                                    </div>
                                }
                            />
                            <ReactJson src={log.payload} collapsed name="payload" />
                        </List.Item>
                    );
                }}
            />
        );
    }
}

export default LogDisplay;
