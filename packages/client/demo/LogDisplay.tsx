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
                            renderItem={(log: Log) => (
                                <List.Item>
                                    <List.Item.Meta
                                        title={
                                            <div>
                                                <span
                                                    style={{
                                                        marginRight: '10px',
                                                        verticalAlign: 'bottom',
                                                    }}
                                                >
                                                    {log.type}
                                                </span>
                                                <Tag>{log.origin}</Tag>
                                            </div>
                                        }
                                    />
                                    <ReactJson src={log.payload} collapsed name="payload" />
                                </List.Item>
                            )}
                        />
                    );
                }}
            </ClientContextConsumer>
        );
    }
}

export default LogDisplay;
