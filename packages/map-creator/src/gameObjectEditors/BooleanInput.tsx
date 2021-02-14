import React from 'react';

interface BooleanInputProps {
    initialValue?: unknown;
    label: string;
    autoFocus?: boolean;
    onCommit?: (value: boolean) => unknown;
}
export const BooleanInput: React.FC<BooleanInputProps> = (props) => {
    const [state, setState] = React.useState(!!props.initialValue);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const { autoFocus = false } = props;
    React.useEffect(() => {
        if (autoFocus) {
            inputRef.current?.focus();
        }
    }, [inputRef, autoFocus]);
    return (
        <div>
            <input
                type="checkbox"
                ref={inputRef}
                checked={state}
                onChange={(e) => {
                    setState(e.target.checked);
                    if (props.onCommit) {
                        props.onCommit(e.target.checked);
                    }
                }}
            />
            {props.label}
        </div>
    );
};
