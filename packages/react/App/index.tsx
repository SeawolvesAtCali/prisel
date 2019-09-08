import React, { useState } from 'react';
import GameContext, { RoomInfo } from '../GameContext';
import { HostContainer, GuestContainer } from '../ClientContainer';
import generateUsername from '../ClientContainer/username';
import Toolbar from './Toolbar';
import styles from './index.css';

function App() {
    const [roomGameType, setRoomGameType] = useState(['', '']);
    const [roomInfo, setRoomInfo] = useState<RoomInfo>(null);
    const [roomId, setRoomId] = useState('');
    const [guests, setGuests] = useState<string[]>([]);
    return (
        <div className={styles.App}>
            <Toolbar>
                {roomId && (
                    <button
                        onClick={() => {
                            const newGuests = guests.concat([generateUsername(guests.length)]);
                            setGuests(newGuests);
                        }}
                    >
                        Add Guest
                    </button>
                )}
            </Toolbar>
            <div className={styles.ClientContainers}>
                <GameContext.Provider
                    value={{
                        gameType: '',
                        roomType: '',
                        roomId,
                        roomInfo,
                        setRoomId,
                        setRoomInfo,
                        setRoomAndGameType: (roomType, gameType) =>
                            setRoomGameType([roomType, gameType]),
                    }}
                >
                    <HostContainer username={generateUsername(0)} />

                    {roomId &&
                        guests.map((guest) => (
                            <GuestContainer username={guest} key={guest} roomId={roomId} />
                        ))}
                </GameContext.Provider>
            </div>
        </div>
    );
}

export default App;
