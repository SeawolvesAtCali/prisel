import React from 'react';
import Container from './Container';
import { Field } from './Field';

export default function Login(props) {
    const { onLogin } = props;

    return (
        <Container title="login">
            <h3>Welcome, tell me your name</h3>
            <Field
                fieldName="name"
                buttonText="Login"
                defaultValue="superman"
                onExecute={onLogin}
            />
        </Container>
    );
}
