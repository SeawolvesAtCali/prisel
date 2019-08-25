import * as React from 'react';
import { Suggestion } from './Chip';
import cn from '../utils/classname';

interface SuggestionProp extends Suggestion {
    highlighted?: boolean;
    onClick?: () => void;
}

function SuggestionItem(props: Omit<SuggestionProp, 'providerKey'>) {
    const { label, value, highlighted, onClick } = props;
    const className = cn('command-input-suggestion-item', { highlight: highlighted });
    const handleClick = React.useCallback(
        (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (onClick) {
                onClick();
            }
        },
        [onClick],
    );
    return (
        <li className={className} onClick={handleClick}>
            {label === undefined ? value : label}
        </li>
    );
}

interface SuggestionListProp {
    selected?: number;
    suggestions?: Suggestion[];
    onSelect?: (selectedItem: Suggestion) => void;
}

export default function SuggestionList(props: SuggestionListProp) {
    const selected = props.selected || 0;
    const { onSelect } = props;
    const { suggestions = [] } = props;
    if (suggestions.length === 0) {
        return null;
    }
    return (
        <ul className="command-input-suggestion-list">
            {suggestions.map((suggestion, index) => (
                <SuggestionItem
                    key={index}
                    type={suggestion.type}
                    value={suggestion.value}
                    label={suggestion.label}
                    highlighted={selected === index}
                    onClick={() => {
                        if (onSelect) {
                            onSelect(suggestion);
                        }
                    }}
                />
            ))}
        </ul>
    );
}
