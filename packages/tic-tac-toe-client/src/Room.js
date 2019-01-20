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

const Room = ({ onStart }) => (
    <Context.Consumer>
        {({ userId, roomState, result }) => {
            if (!roomState) {
                return null;
            }
            return (
                <Container title={roomState.name}>
                    <span>ROOM ID: {roomState.id}</span>
                    <div className="players-container">
                        {Object.values(roomState.players).map((player) => {
                            const playerInfo = roomState.clientMap[player];
                            return (
                                <Player
                                    key={player}
                                    username={playerInfo.username}
                                    id={player}
                                    isHost={player === roomState.host}
                                    isSelf={userId === player}
                                    onStart={onStart}
                                />
                            );
                        })}

                        <div />
                    </div>
                    {result}
                </Container>
            );
        }}
    </Context.Consumer>
);

export default Room;
