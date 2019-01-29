import * as React from 'react';
import { ClientContextConsumer, Log } from './ClientContainer';
import { Tag, List } from 'antd';
import ReactJson from 'react-json-view';

class LogDisplay extends React.Component {
    public render() {
        return (
            <ClientContextConsumer>
                {({ logs }) => {
                    return (
                        <List
                            itemLayout="vertical"
                            dataSource={logs}
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
                }}
            </ClientContextConsumer>
        );
    }
}

export default LogDisplay;
