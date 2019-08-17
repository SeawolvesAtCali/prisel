import * as React from 'react';
import { SuggestionProvider } from './SuggestionProvider';
import './style.css';
import Dropdown from './Dropdown';
import { Suggestion, Chip } from './Chip';
import SuggestionList from './SuggestionList';
import cn from '../utils/classname';
import { Button } from 'antd';
import run from './runCommand';

interface CommandInputProps {
    suggestionProviders?: SuggestionProvider[];
    expand: boolean;
    onRun?: (jsonObject: object) => void;
}

function stopEvent(e: Event) {
    e.preventDefault();
    e.stopPropagation();
}

function useKeyControll(
    hoverPrevSuggestion: () => void,
    hoverNextSuggestion: () => void,
    selectSuggestion: () => void,
    setDropdownOpen: (open: boolean) => void,
) {
    const handleKeyPress = React.useCallback(
        (e) => {
            switch (e.key) {
                case 'Escape':
                    setDropdownOpen(false);
                    break;
                case 'Enter':
                    selectSuggestion();
                    stopEvent(e);
                    break;
                case 'ArrowDown':
                    setDropdownOpen(true);
                    hoverNextSuggestion();
                    stopEvent(e);
                    break;
                case 'ArrowUp':
                    hoverPrevSuggestion();
                    stopEvent(e);
                    break;
                default:
                // do nothing;
            }
        },
        [hoverPrevSuggestion, hoverNextSuggestion, selectSuggestion],
    );
    return handleKeyPress;
}

function moveIndex(currentIndex: number, total: number, diff: 1 | -1) {
    const corrected = currentIndex >= total ? total - 1 : currentIndex;
    if (total === 0) {
        return 0;
    }
    return (corrected + total + diff) % total;
}

function generateSuggestions(
    suggestionProviders: SuggestionProvider[],
    chips: Suggestion[],
    input: string,
): Suggestion[] {
    return suggestionProviders
        .map((provider) => {
            const suggestions = provider.getSuggestion(chips, input);
            return suggestions;
        })
        .flat();
}

function CommandInput(props: CommandInputProps) {
    const { suggestionProviders = [], expand = false, onRun } = props;
    const [input, rawSetInput] = React.useState('');
    const [chips, setChips] = React.useState([] as Suggestion[]);
    const [focused, setFocused] = React.useState(false);
    const [highlightedChipIndex, setHighlightedChipIndex] = React.useState(-1);
    const [hoveredSuggestion, setHoveredSuggestion] = React.useState(0);
    const [suggestions, setSuggestions] = React.useState(
        generateSuggestions(suggestionProviders, chips, input),
    );
    const inputRef = React.useRef(null);
    const dropdownRef = React.useRef(null);

    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const updateSuggestions = React.useCallback(
        (currentChips: Suggestion[], currentInput: string) => {
            setSuggestions(generateSuggestions(suggestionProviders, currentChips, currentInput));
        },
        [suggestionProviders],
    );

    const setInput = React.useCallback(
        (e) => {
            rawSetInput(e.target.value);
            setDropdownOpen(true);
            updateSuggestions(chips, e.target.value);
            setHoveredSuggestion(0);
        },
        [rawSetInput, chips],
    );

    const hoverPrevSuggestion = React.useCallback(() => {
        setHoveredSuggestion(moveIndex(hoveredSuggestion, suggestions.length, -1));
    }, [suggestions, hoveredSuggestion]);

    const hoverNextSuggestion = React.useCallback(() => {
        setHoveredSuggestion(moveIndex(hoveredSuggestion, suggestions.length, 1));
    }, [suggestions, hoveredSuggestion]);

    const selectSuggestion = React.useCallback(
        (selectedSuggestion?: Suggestion) => {
            const suggestion = selectedSuggestion || suggestions[hoveredSuggestion];
            if (suggestion) {
                const { providerKey } = suggestion;
                const selectedProvider = suggestionProviders.find(
                    (provider) => provider.key === providerKey,
                );
                const newChips = selectedProvider
                    ? selectedProvider.onSelected(suggestion, chips, input)
                    : [];
                const updatedChips = [...chips, ...newChips];
                setChips(updatedChips);
                rawSetInput('');
                updateSuggestions(updatedChips, '');
                inputRef.current.focus();
            }
            dropdownRef.current.align();
        },
        [input, chips, suggestions, hoveredSuggestion],
    );
    const handleKeyPress = useKeyControll(
        hoverPrevSuggestion,
        hoverNextSuggestion,
        selectSuggestion,
        setDropdownOpen,
    );
    const handleRun = React.useCallback(() => {
        if (onRun) {
            run(chips, () => {}, onRun);
        }
    }, [chips, onRun]);

    const inputContainerClass = cn('command-input-container', { focused });
    const containerClass = cn('command-input-outer-container', { expand });
    const ref = React.useRef(null as HTMLDivElement);
    return (
        <div className={containerClass}>
            <div
                className={inputContainerClass}
                ref={ref}
                onClick={(e) => {
                    inputRef.current.focus();
                }}
            >
                {chips.map((chip, index) => (
                    <Chip
                        key={index}
                        {...chip}
                        editMode={highlightedChipIndex === index}
                        onClick={() => {
                            setHighlightedChipIndex(index);
                        }}
                        onDelete={() => {
                            let newChips: Suggestion[] = [];
                            // it's a command type, remove all the chips
                            if (chips[index].type !== 'command') {
                                newChips = chips.filter((_, chipIndex) => index !== chipIndex);
                            }
                            setChips(newChips);
                            updateSuggestions(newChips, input);
                            dropdownRef.current.align();
                        }}
                    />
                ))}
                <input
                    onFocus={() => {
                        setFocused(true);
                        setDropdownOpen(true);
                    }}
                    onBlur={() => {
                        setFocused(false);
                    }}
                    ref={inputRef}
                    className="command-input-input"
                    onChange={setInput}
                    value={input}
                    onKeyDown={handleKeyPress}
                    autoFocus
                />
                <Dropdown
                    open={dropdownOpen}
                    target={ref}
                    ref={dropdownRef}
                    sameWidth
                    onClickOutside={(e, clickedOnTarget) => {
                        if (!clickedOnTarget) {
                            setDropdownOpen(false);
                        }
                    }}
                >
                    <SuggestionList
                        suggestions={suggestions}
                        selected={hoveredSuggestion}
                        onSelect={selectSuggestion}
                    />
                </Dropdown>
            </div>
            <Button type="primary" onClick={handleRun}>
                RUN
            </Button>
        </div>
    );
}

export default CommandInput;
