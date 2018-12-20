import * as React from 'react';
import ClientContainer from './clientContainer';
import defaultProfile from './profile';
import { produce } from 'immer';

interface AppState {
    clients: number[];
}
class App extends React.Component<{}, AppState> {
    public state: AppState = {
        clients: [0],
    };

    public render() {
        return (
            <div style={{ overflow: 'auto', whiteSpace: 'nowrap', height: '100vh' }}>
                {this.state.clients.map((client) => (
                    <ClientContainer profile={defaultProfile} key={client} />
                ))}
                <button
                    onClick={this.handleAddClient}
                    style={{
                        height: '600px',
                        width: '400px',
                        background: '#f0f0f5',
                        border: '1px solid lightgrey',
                        boxSizing: 'border-box',
                        fontSize: '30px',
                        verticalAlign: 'top',
                        outline: 'none',
                    }}
                >
                    Add Client
                </button>
            </div>
        );
    }
    private handleAddClient = () => {
        this.setState((state) =>
            produce(state, (draft) => {
                draft.clients.push(state.clients.length);
            }),
        );
    };
}

export default App;
