import React from 'react';
import Context from './context';
import './styles/Room.css';
import Container from './Container';

const ReadyButton = ({ isReady, onClick }) => (
    <button onClick={onClick}>{isReady ? 'UNREADY' : 'READY'}</button>
);
const StartButton = ({ onClick }) => <button onClick={onClick}>START</button>;

const Player = ({ username, isReady, id, isHost, isSelf, onReady, onStart }) => {
    return (
        <div className={isSelf ? 'self-player-container player-container' : 'player-container'}>
            <h2>{username}</h2>
            {!isHost && <p>{isReady ? 'READY' : 'NOT READY'}</p>}
            {isSelf && isHost && <StartButton onClick={onStart} />}
            {isSelf && !isHost && <ReadyButton onClick={onReady} />}
        </div>
    );
};

const Room = ({ onReady, onStart }) => (
    <Context.Consumer>
        {({ userId, roomState, result }) => {
            if (!roomState) {
                return null;
            }
            return (
                <Container title={roomState.name}>
                    <span>ROOM ID: {roomState.id}</span>
                    <div className="players-container">
                        {Object.values(roomState.clients).map((client) => (
                            <Player
                                key={client.id}
                                username={client.username}
                                isReady={client.isReady}
                                id={client.id}
                                isHost={client.id === roomState.host}
                                isSelf={userId === client.id}
                                onReady={onReady}
                                onStart={onStart}
                            />
                        ))}
                        <div />
                    </div>
                    {result}
                </Container>
            );
        }}
    </Context.Consumer>
);

export default Room;
