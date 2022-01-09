import React from 'react';
import Container from './Container';
import { Field } from './Field';
import './styles/Lobby.css';

export const Lobby: React.FC<{
    onJoin: (roomId: string) => void;
    onCreate: (roomName: string) => void;
}> = (props) => {
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
};
