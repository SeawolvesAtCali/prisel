import React from 'react';

interface NumberInputProps {
    initialValue?: number;
    label: string;
    autoFocus?: boolean;
    onCommit?: (value: number) => unknown;
}

export const NumberInput: React.FC<NumberInputProps> = (props) => {
    const [state, setState] = React.useState(`${props.initialValue || 0}`);
    const { autoFocus = false } = props;
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    React.useEffect(() => {
        if (autoFocus) {
            inputRef.current?.select();
        }
    }, [inputRef, autoFocus]);

    return (
        <div>
            {props.label}
            <input
                ref={inputRef}
                value={state}
                onChange={(e) => {
                    const { written, value } = getValidPrefix(e.target.value);
                    setState(written);
                    if (props.onCommit) {
                        props.onCommit(value);
                    }
                }}
            />
        </div>
    );
};

function getValidPrefix(
    numString: String,
): {
    written: string;
    value: number;
} {
    const trimmed = numString.trim();
    switch (trimmed) {
        case '':
        case '-':
            return { written: trimmed, value: 0 };
        default:
            return {
                written: `${Number.parseInt(trimmed)}` || '',
                value: Number.parseInt(trimmed) || 0,
            };
    }
}
