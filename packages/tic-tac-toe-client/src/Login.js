import React from 'react';
import Container from './Container';

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = { username: '' };
    }
    render() {
        return (
            <Container title="login">
                <h3>Welcome, tell me your name</h3>
                <div className="field-container">
                    <label className="one-fourth-width">name</label>
                    <input
                        className="half-width"
                        value={this.state.username}
                        onChange={(e) => this.setState({ username: e.target.value })}
                    />
                    <button
                        className="one-fourth-width"
                        onClick={() => this.props.onLogin(this.state.username)}
                    >
                        Login
                    </button>
                </div>
            </Container>
        );
    }
}
