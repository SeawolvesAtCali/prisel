import React from 'react';
import './styles/Lobby.css';
import Container from './Container';
import { Field } from './Field';

export default function Lobby(props) {
    const { onJoin, onCreate } = props;
    return (
        <Container title="lobby">
            <h3>Join a room</h3>
            <Field fieldName="id" buttonText="JOIN" defaultValue="ROOM-1" onExecute={onJoin} />
            <p className="or">--- or ---</p>
            <h3>Create a room</h3>
            <Field
                fieldName="name"
                buttonText="CREATE"
                defaultValue="living room"
                onExecute={onCreate}
            />
        </Container>
    );
}
