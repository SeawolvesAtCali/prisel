import * as React from 'react';
import ClientContainer from './clientContainer';
import defaultProfile from './profile';
import RoomManager from './RoomManager';
import { produce } from 'immer';

interface AppState {
    clients: number[];
}

const generateUsername = (index: number) => {
    const usernameList = [
        'dog',
        'cat',
        'cow',
        'sheep',
        'rabbit',
        'duck',
        'chicken',
        'hen',
        'horse',
        'pig',
        'turkey',
        'donkey',
        'goat',
        'guinea pig',
        'llama',
    ];
    if (index < usernameList.length) {
        return usernameList[index];
    }
    return `user-${index}`;
};

class App extends React.Component<{}, AppState> {
    public state: AppState = {
        clients: [0],
    };

    public render() {
        return (
            <div style={{ overflow: 'auto', whiteSpace: 'nowrap', height: '100vh' }}>
                {this.state.clients.map((client, index) => (
                    <ClientContainer
                        profile={defaultProfile}
                        key={client}
                        username={generateUsername(index)}
                    >
                        <RoomManager gameTypes={['tic-tac-toe', 'big-2']} />
                    </ClientContainer>
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
