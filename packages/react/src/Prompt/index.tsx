import * as React from 'react';
import styles from './index.module.css';
import Chip from '../Chip';
import suggestionProviders, { SuggestionProvider } from '../suggestionProviders';
import Suggestion from '../Suggestion';

interface InputProps {
    value: string;
    onChange: (value: string) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

function InputContainer({ children }: { children: React.ReactNode }) {
    return <div className={styles.inputContainer}>{children}</div>;
}
const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const { value, onChange, onKeyDown } = props;
    const handleChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
        [onChange],
    );

    return (
        <>
            <span className={styles.instruction}>CTRL + ENTER TO SUBMIT</span>
            <input
                ref={ref}
                className={styles.input}
                value={value}
                onChange={handleChange}
                onKeyDown={onKeyDown}
            />
        </>
    );
});

Input.displayName = 'Input';

function generateSuggestions(
    providers: SuggestionProvider[],
    chips: Suggestion[],
    input: string,
): Suggestion[] {
    return providers
        .map((provider) => {
            const suggestions = provider.getSuggestion(chips, input);
            return suggestions;
        })
        .flat();
}

function selectSuggestion(suggestion: Suggestion, chips: Suggestion[], input: string) {
    const selectedProvider = suggestionProviders.find(
        (provider) => provider.key === suggestion.providerKey,
    );
    const newChips = selectedProvider ? selectedProvider.onSelected(suggestion, chips, input) : [];
    return newChips;
}

function getKey(suggestion: Suggestion) {
    return suggestion.providerKey + (suggestion.key || '');
}

interface PromptProps {
    onSubmit: (chips: Suggestion[]) => void;
}

function setNextEditingChip(
    currentEditingIndex: number,
    chips: Suggestion[],
    setEditingChip: React.Dispatch<React.SetStateAction<Suggestion | null>>,
) {
    if (currentEditingIndex !== undefined) {
        const nextChip =
            chips.find(
                (chip, index) => chip.type === 'placeholderParam' && index > currentEditingIndex,
            ) || null;
        setEditingChip(nextChip);
    }
}

function Prompt({ onSubmit }: PromptProps) {
    const [input, setInput] = React.useState('');
    const [chips, setChips] = React.useState<Suggestion[]>([]);
    const [editingChip, setEditingChip] = React.useState<Suggestion | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const suggestions = generateSuggestions(suggestionProviders, chips, input);

    const handleSubmit = React.useCallback(() => {
        if (onSubmit) {
            onSubmit(chips);
        }
        setInput('');
        setChips([]);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [chips, onSubmit]);
    const handleSelect = React.useCallback(
        (suggestion: Suggestion) => {
            const newChips = chips.slice();

            let firstInsertedIndex = 0;
            if (editingChip) {
                const editingIndex = newChips.findIndex((chip) => chip === editingChip);
                if (editingIndex >= 0) {
                    newChips[editingIndex] = {
                        ...selectSuggestion(suggestion, chips, input)[0],
                        key: editingChip.key,
                    };
                    firstInsertedIndex = editingIndex;
                }
            } else {
                const currentLength = newChips.length;
                newChips.push(...selectSuggestion(suggestion, chips, input));
                firstInsertedIndex = currentLength;
            }

            if (editingChip || suggestion.type === 'command') {
                setNextEditingChip(firstInsertedIndex, newChips, setEditingChip);
            }
            setChips(newChips);
            setInput('');
            if (inputRef.current) {
                inputRef.current.focus();
            }
        },
        [chips, input, editingChip],
    );

    const handleDelete = (chip: Suggestion) => {
        let newChips: Suggestion[] = [];
        // it's a command type, remove all the chips
        if (chip.type !== 'command') {
            newChips = chips.filter((filteredChip) => filteredChip !== chip);
        }

        setChips(newChips);
        if (editingChip) {
            setEditingChip(null);
        }
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (e.ctrlKey) {
                handleSubmit();
            } else if (suggestions.length) {
                handleSelect(suggestions[0]);
            }
            return;
        }
        if (e.key.match(/[0-9]/) && e.ctrlKey) {
            const suggestionIndex = parseInt(e.key, 10) - 1;
            if (suggestionIndex >= 0 && suggestionIndex < suggestions.length) {
                handleSelect(suggestions[suggestionIndex]);
            }
            return;
        }
        if (e.key === 'Backspace') {
            if (input.length === 0 && chips.length > 0) {
                handleDelete(chips.slice(-1)[0]);
            }
            return;
        }
    };
    return (
        <div className={styles.container}>
            <InputContainer>
                {chips.map((chip) => (
                    <Chip.Edit
                        {...chip}
                        editing={editingChip === chip}
                        key={getKey(chip)}
                        onDelete={() => handleDelete(chip)}
                        onClick={() => {
                            if (chip.type === 'placeholderParam') {
                                setEditingChip(editingChip === chip ? null : chip);
                                if (inputRef.current) {
                                    inputRef.current.focus();
                                }
                            }
                        }}
                    />
                ))}
                <Input ref={inputRef} value={input} onKeyDown={handleKeyDown} onChange={setInput} />
            </InputContainer>
            <div className={styles.suggestionContainer}>
                {suggestions.map((suggestion, index) => (
                    <Chip.Display
                        {...suggestion}
                        key={getKey(suggestion)}
                        onClick={(e) => handleSelect(suggestion)}
                        selectIndex={index + 1}
                    />
                ))}
            </div>
        </div>
    );
}

export default Prompt;
