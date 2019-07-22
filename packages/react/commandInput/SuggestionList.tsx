import * as React from 'react';
import { Suggestion } from './Chip';

interface SuggestionProp extends Suggestion {
    highlighted?: boolean;
}

function SuggestionItem(props: SuggestionProp) {
    const { label, value, highlighted } = props;
    const className = ['command-input-suggestion-item', highlighted ? 'highlight' : ''].join(' ');
    return <li className={className}>{label === undefined ? value : label}</li>;
}

interface SuggestionListProp {
    selected?: number;
    suggestions?: Suggestion[];
}

export default function SuggestionList(props: SuggestionListProp) {
    const selected = props.selected || 0;
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
                />
            ))}
        </ul>
    );
}
