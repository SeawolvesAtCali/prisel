import React from 'react';
import Container from './Container';
import Context from './context';
import './styles/Room.css';

const StartButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button onClick={onClick}>START</button>
);

const Player: React.FC<{
    username: string;
    id: string;
    isHost: boolean;
    isSelf: boolean;
    onStart: () => void;
}> = ({ username, isHost, isSelf, onStart }) => {
    return (
        <div className={isSelf ? 'self-player-container player-container' : 'player-container'}>
            <h2>{username}</h2>
            {isSelf && isHost && <StartButton onClick={onStart} />}
        </div>
    );
};

export const Room: React.FC<{ onStart: () => void }> = ({ onStart }) => (
    <Context.Consumer>
        {({ id, players, host, roomId, roomName }) => {
            return (
                <Container title={roomName || 'unnamed room'}>
                    <span>ROOM ID: {roomId}</span>
                    <div className="players-container">
                        {players.map((player) => {
                            return (
                                <Player
                                    key={player.id}
                                    username={player.name}
                                    id={player.id}
                                    isHost={player.id === host}
                                    isSelf={id === player.id}
                                    onStart={onStart}
                                />
                            );
                        })}
                        <div />
                    </div>
                </Container>
            );
        }}
    </Context.Consumer>
);
