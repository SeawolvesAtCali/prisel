import React, { useState } from 'react';
import GameContext from '../GameContext';
import { HostContainer, GuestContainer } from '../ClientContainer';
import generateUsername from '../ClientContainer/username';
import { Toolbar, ToolbarItem } from '../Toolbar';
import styles from './index.module.css';
import { CommandEditor, useCommandEditor } from '../commandEditor';

function App() {
    const [roomId, setRoomId] = useState('');
    const [guests, setGuests] = useState<string[]>([]);
    const [commands, handleSaveCommand] = useCommandEditor();

    return (
        <div className={styles.App}>
            <Toolbar>
                {roomId && (
                    <ToolbarItem
                        onClick={() => {
                            const newGuests = guests.concat([generateUsername(guests.length)]);
                            setGuests(newGuests);
                        }}
                    >
                        Add Guest
                    </ToolbarItem>
                )}
                <CommandEditor onSave={handleSaveCommand} savedCommands={commands} />
            </Toolbar>
            <div className={styles.ClientContainers}>
                <GameContext.Provider
                    value={{
                        gameType: '',
                        roomType: '',
                        roomId,
                        setRoomId,
                    }}
                >
                    <HostContainer
                        username={generateUsername(0)}
                        displayBorder={guests.length > 0}
                    />

                    {roomId &&
                        guests.map((guest, index) => (
                            <GuestContainer
                                username={guest}
                                key={guest}
                                roomId={roomId}
                                displayBorder={index < guests.length - 1}
                            />
                        ))}
                </GameContext.Provider>
            </div>
        </div>
    );
}

export default App;
