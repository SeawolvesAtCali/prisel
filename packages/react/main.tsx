import * as React from 'react';
import ClientContainer from './ClientContainer';
import RoomManager from './RoomManager';
import GameStartButton from './GameStartButton';
import CommandEditor from './commandEditor/CommandEditor';
import CommandManager, { Command } from './commandEditor/commandManager';

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

export default function App() {
    const [clients, setClients] = React.useState([0]);
    const [commands, setCommands] = React.useState<Command[]>(CommandManager.getAll());
    const addClient = React.useCallback(() => {
        setClients((prevClients) => [...clients, clients.length]);
    }, [clients]);

    const handleSaveCommand = React.useCallback((title, script, tokens) => {
        CommandManager.add(title, script, tokens);
        CommandManager.refresh();
        setCommands(CommandManager.getAll());
    }, []);
    return (
        <div style={{ overflow: 'auto', whiteSpace: 'nowrap', height: '100vh' }}>
            <CommandEditor onSave={handleSaveCommand} savedCommands={commands} />
            {clients.map((client, index) => (
                <ClientContainer key={client} username={generateUsername(index)}>
                    <RoomManager />
                    <GameStartButton />
                </ClientContainer>
            ))}
            <button
                onClick={addClient}
                style={{
                    height: '600px',
                    width: '400px',
                    background: '#f0f0f5',
                    border: '1px solid lightgrey',
                    boxSizing: 'border-box',
                    fontSize: '30px',
                    verticalAlign: 'top',
                    outline: 'none',
                    margin: '5px',
                }}
            >
                Add Client
            </button>
        </div>
    );
}
