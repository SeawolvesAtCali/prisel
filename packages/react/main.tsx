import * as React from 'react';
import ClientContainer from './ClientContainer';
import RoomManager from './RoomManager';
import GameStartButton from './GameStartButton';
import CommandInput from './commandInput/CommandInput';
import { ChipEdit } from './commandInput/Chip';
import CommandSuggestionProvider from './commandInput/CommandSuggestionProvider';
import StringProvider from './commandInput/StringProvider';
import NumberProvider from './commandInput/NumberProvider';
import BooleanProvider from './commandInput/BooleanProvider';
import NullProvider from './commandInput/NullProvider';
import VariableProvider from './commandInput/VariableProvider';

const commandProvider = new CommandSuggestionProvider(['chat', 'send', 'tell']);
const stringProvider = new StringProvider();
const numberProvider = new NumberProvider();
const booleanProvider = new BooleanProvider();
const nullProvider = new NullProvider();
const variableProvider = new VariableProvider(['cat', 'dog', 'null']);

const providers = [
    commandProvider,
    variableProvider,
    numberProvider,
    nullProvider,
    booleanProvider,
    stringProvider,
];

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
    const addClient = React.useCallback(() => {
        setClients((prevClients) => [...clients, clients.length]);
    }, [clients]);

    return (
        <div style={{ overflow: 'auto', whiteSpace: 'nowrap', height: '100vh' }}>
            {clients.map((client, index) => (
                <ClientContainer key={client} username={generateUsername(index)}>
                    <RoomManager />
                    <GameStartButton />
                    <CommandInput suggestionProviders={providers} expand />
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
