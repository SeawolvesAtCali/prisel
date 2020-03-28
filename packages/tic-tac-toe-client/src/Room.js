import React from 'react';
import Context from './context';
import './styles/Room.css';
import Container from './Container';

const StartButton = ({ onClick }) => <button onClick={onClick}>START</button>;

const Player = ({ username, id, isHost, isSelf, onStart }) => {
    return (
        <div className={isSelf ? 'self-player-container player-container' : 'player-container'}>
            <h2>{username}</h2>
            {isSelf && isHost && <StartButton onClick={onStart} />}
        </div>
    );
};

const Room = ({ onStart, onLeave }) => (
    <Context.Consumer>
        {({ id, players, host, roomId, roomName }) => {
            return (
                <Container title={roomName}>
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
                    <button onClick={onLeave}>LEAVE</button>
                </Container>
            );
        }}
    </Context.Consumer>
);

export default Room;
