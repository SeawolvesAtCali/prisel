import * as React from 'react';
import { SuggestionProvider } from './SuggestionProvider';
import './style.css';
import Dropdown from './Dropdown';
import { Suggestion, ChipEdit } from './Chip';
import SuggestionList from './SuggestionList';

interface CommandInputProps {
    suggestionProviders?: SuggestionProvider[];
    expand: boolean;
}

function stopEvent(e: Event) {
    e.preventDefault();
    e.stopPropagation();
}

function useKeyControll(
    hoverPrevSuggestion,
    hoverNextSuggestion,
    selectSuggestion,
    setDropdownOpen,
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
                case 'Tab':
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
    return (suggestionProviders.map((provider) => {
        const suggestions = provider.getSuggestion(chips, input);
        return suggestions;
    }) as any).flat();
}

function CommandInput(props: CommandInputProps) {
    const { suggestionProviders = [], expand = false } = props;
    const [input, rawSetInput] = React.useState('');
    const [chips, setChips] = React.useState([] as Suggestion[]);
    const [focused, setFocused] = React.useState(false);
    const [hoveredSuggestion, setHoveredSuggestion] = React.useState(0);
    const [suggestions, setSuggestions] = React.useState(
        generateSuggestions(suggestionProviders, chips, input),
    );

    const [dropdownOpen, setDropdownOpen] = React.useState(false);
    const updateSuggestions = React.useCallback(
        (currentChips: Suggestion[], currentInput: string) => {
            setSuggestions(generateSuggestions(suggestionProviders, currentChips, currentInput));
        },
        [suggestionProviders, chips],
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

    const selectSuggestion = React.useCallback(() => {
        if (suggestions[hoveredSuggestion]) {
            const newChips = [...chips, suggestions[hoveredSuggestion]];
            setChips(newChips);
            rawSetInput('');
            updateSuggestions(newChips, '');
        }
    }, [input, hoveredSuggestion, suggestions]);
    const handleKeyPress = useKeyControll(
        hoverPrevSuggestion,
        hoverNextSuggestion,
        selectSuggestion,
        setDropdownOpen,
    );

    const containerClass = [
        'command-input-container',
        focused ? 'focused' : '',
        expand ? 'expand' : '',
    ].join(' ');
    const ref = React.useRef(null as HTMLDivElement);
    return (
        <div className={containerClass} ref={ref}>
            {chips.map((chip, index) => (
                <ChipEdit key={index} {...chip} />
            ))}
            <input
                onFocus={() => {
                    setFocused(true);
                    setDropdownOpen(true);
                }}
                onBlur={() => {
                    setFocused(false);
                    setDropdownOpen(false);
                }}
                className="command-input-input"
                onChange={setInput}
                value={input}
                onKeyDown={handleKeyPress}
                autoFocus
            />
            <Dropdown open={dropdownOpen} target={ref} sameWidth>
                <SuggestionList suggestions={suggestions} selected={hoveredSuggestion} />
            </Dropdown>
        </div>
    );
}

export default CommandInput;
