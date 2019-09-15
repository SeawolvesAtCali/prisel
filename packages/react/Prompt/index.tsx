import * as React from 'react';
import styles from './index.css';
import Chip from '../Chip';
import suggestionProviders from '../suggestionProviders';
import { SuggestionProvider } from '../commandInput/SuggestionProvider';
import Suggestion from '../Suggestion';

interface InputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onSelect: () => void;
    onSelectIndex: (index: number) => void;
}

function InputContainer({ children }: { children: React.ReactNode }) {
    return <div className={styles.inputContainer}>{children}</div>;
}
const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
    const { value, onChange, onSubmit, onSelect, onSelectIndex } = props;
    const handleChange = React.useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value),
        [onChange],
    );

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            if (e.ctrlKey) {
                onSubmit();
            } else {
                onSelect();
            }
            return;
        }
        if (e.key >= '0' && e.key <= '9' && e.ctrlKey) {
            // select the suggestion
            onSelectIndex(parseInt(e.key, 10));
        }
    };
    return (
        <>
            <span className={styles.instruction}>CTRL + ENTER TO SUBMIT</span>
            <input
                ref={ref}
                className={styles.input}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
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
    setEditingChip: React.Dispatch<React.SetStateAction<Suggestion>>,
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
    const [editingChip, setEditingChip] = React.useState<Suggestion>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const handleSubmit = React.useCallback(() => {
        if (onSubmit) {
            onSubmit(chips);
        }
        setInput('');
        setChips([]);
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [chips]);
    const handleSelect = React.useCallback(
        (suggestion: Suggestion) => {
            const newChips = chips.slice();

            let fistInsertedIndex;
            if (editingChip) {
                const editingIndex = newChips.findIndex((chip) => chip === editingChip);
                if (editingIndex >= 0) {
                    newChips[editingIndex] = {
                        ...selectSuggestion(suggestion, chips, input)[0],
                        key: editingChip.key,
                    };
                    fistInsertedIndex = editingIndex;
                }
            } else {
                const currentLength = newChips.length;
                newChips.push(...selectSuggestion(suggestion, chips, input));
                fistInsertedIndex = currentLength;
            }

            if (editingChip || suggestion.type === 'command') {
                setNextEditingChip(fistInsertedIndex, newChips, setEditingChip);
            }
            setChips(newChips);
            setInput('');
            inputRef.current.focus();
        },
        [chips, input, editingChip],
    );
    const suggestions = generateSuggestions(suggestionProviders, chips, input);
    return (
        <div className={styles.container}>
            <InputContainer>
                {chips.map((chip) => (
                    <Chip.Edit
                        {...chip}
                        editing={editingChip === chip}
                        key={getKey(chip)}
                        onDelete={(e) => {
                            let newChips: Suggestion[] = [];
                            // it's a command type, remove all the chips
                            if (chip.type !== 'command') {
                                newChips = chips.filter((filteredChip) => filteredChip !== chip);
                            }

                            setChips(newChips);
                            inputRef.current.focus();
                        }}
                        onClick={(e) => {
                            if (chip.type === 'placeholderParam') {
                                setEditingChip(editingChip === chip ? null : chip);
                                inputRef.current.focus();
                            }
                        }}
                    />
                ))}
                <Input
                    ref={inputRef}
                    value={input}
                    onChange={setInput}
                    onSubmit={handleSubmit}
                    onSelect={() => suggestions.length > 0 && handleSelect(suggestions[0])}
                    onSelectIndex={(userIndex: number) => {
                        if (suggestions.length >= userIndex && userIndex > 0) {
                            handleSelect(suggestions[userIndex - 1]);
                        }
                    }}
                />
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
