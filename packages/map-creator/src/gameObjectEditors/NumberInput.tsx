import React from 'react';

interface NumberInputProps {
    initialValue?: number;
    label: string;
    autoFocus?: boolean;
    onCommit?: (value: number) => unknown;
}

export const NumberInput: React.FC<NumberInputProps> = (props) => {
    const [state, setState] = React.useState(props.initialValue || 0);
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
                    const value = Number.parseInt(e.target.value, 10) || 0;
                    setState(value);
                    if (props.onCommit) {
                        props.onCommit(value);
                    }
                }}
            />
        </div>
    );
};
