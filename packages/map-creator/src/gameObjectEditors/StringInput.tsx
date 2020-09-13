import React from 'react';

interface StringInputProps {
    initialValue?: string;
    label: string;
    autoSelect?: boolean;
    onCommit?: (value: string) => unknown;
}

export const StringInput: React.FC<StringInputProps> = (props) => {
    const [state, setState] = React.useState(props.initialValue || '');
    const { autoSelect = false } = props;
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    React.useEffect(() => {
        if (autoSelect) {
            inputRef.current?.select();
        }
    }, [inputRef, autoSelect]);
    return (
        <div>
            {props.label}
            <input
                ref={inputRef}
                value={state}
                onChange={(e) => {
                    setState(e.target.value);
                    if (props.onCommit) {
                        props.onCommit(e.target.value);
                    }
                }}
            />
        </div>
    );
};
