import * as React from 'react';
import noop from 'lodash/noop';

interface TextInputProps {
    value: string;
    onInput: (value: string) => void;
    placeholder: string;
}

const TextInput = ({ value = '', onInput = noop, placeholder = '' }: TextInputProps) => (
    <input
        value={value}
        onInput={(e) => onInput(e.currentTarget.value)}
        placeholder={placeholder}
    />
);

export default TextInput;
