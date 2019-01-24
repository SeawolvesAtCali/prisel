import * as React from 'react';
import { ClientContextConsumer } from './clientContainer';

class LogDisplay extends React.Component {
    public render() {
        return (
            <ClientContextConsumer>
                {({ logs }) => {
                    return (
                        <React.Fragment>
                            {logs.map((log) => (
                                <div>
                                    <span>{log}</span>
                                </div>
                            ))}
                        </React.Fragment>
                    );
                }}
            </ClientContextConsumer>
        );
    }
}

export default LogDisplay;
