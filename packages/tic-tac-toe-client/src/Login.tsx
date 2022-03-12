import React from 'react';
import Container from './Container';
import { Field } from './Field';

export const Login: React.FC<{ onLogin: (username: string) => void }> = (props) => {
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
};
