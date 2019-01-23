import * as React from 'react';
import { ClientContextConsumer } from './clientContainer';

class LogDisplay extends React.Component {
    public render() {
        return (
            <ClientContextConsumer>
                {(client) => {
                    return <div />;
                }}
            </ClientContextConsumer>
        );
    }
}

export default LogDisplay;
