import React from 'react';
import { useUniqueId } from '../useUniqueId';

interface EnumInputProps {
    initialValue: number | string;
    autoFocus?: boolean;
    enumMap: { [key: string]: number | string };
    onCommit?: (value: any) => unknown;
    label: string;
}

export const EnumInput: React.FC<EnumInputProps> = ({
    autoFocus = false,
    initialValue,
    enumMap,
    onCommit,
    label,
}) => {
    const uniqueName = useUniqueId();

    const [descriptionState, setDescription] = React.useState(initialValue);

    const inputRef = React.useRef<HTMLInputElement | null>(null);
    React.useEffect(() => {
        if (autoFocus) {
            inputRef.current?.focus();
        }
    }, [inputRef, autoFocus]);

    return (
        <div>
            <label htmlFor={uniqueName}>{label}</label>
            <select
                name={uniqueName}
                id={uniqueName}
                value={descriptionState}
                onChange={(e) => {
                    if (e.target.value in enumMap) {
                        const value = e.target.value;
                        setDescription(value);
                        if (onCommit) {
                            onCommit(enumMap[value]);
                        }
                    } else {
                        console.log('value not in enummap', e.target.value);
                    }
                }}
            >
                {Object.keys(enumMap).map((description) => {
                    return (
                        <option value={description} key={description}>
                            {description}
                        </option>
                    );
                })}
            </select>
        </div>
    );
};
