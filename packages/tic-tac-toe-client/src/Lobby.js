import React from 'react';
import './styles/Lobby.css';
import Container from './Container';

export default class Lobby extends React.Component {
    constructor(props) {
        super(props);
        this.state = { roomId: 'ROOM-1', roomName: 'living room' };
    }
    render() {
        return (
            <Container title="lobby">
                <h3>Join a room</h3>
                <div className="field-container">
                    <label className="one-fourth-width">id</label>
                    <input
                        className="half-width"
                        value={this.state.roomId}
                        onChange={(e) => this.setState({ roomId: e.target.value })}
                    />
                    <button
                        className="one-fourth-width"
                        onClick={() => this.props.onJoin(this.state.roomId)}
                    >
                        JOIN
                    </button>
                </div>
                <p className="or">--- or ---</p>
                <h3>Create a room</h3>
                <div className="field-container">
                    <label className="one-fourth-width">name</label>
                    <input
                        className="half-width"
                        value={this.state.roomName}
                        onChange={(e) => this.setState({ roomName: e.target.value })}
                    />
                    <button
                        className="one-fourth-width"
                        onClick={() => this.props.onCreate(this.state.roomName)}
                    >
                        CREATE
                    </button>
                </div>
            </Container>
        );
    }
}
