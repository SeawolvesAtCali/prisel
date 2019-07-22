import { SuggestionProvider } from './SuggestionProvider';
import { Suggestion } from './Chip';

export default class NullProvider extends SuggestionProvider {
    public getSuggestion(chips: Suggestion[], currentInput: string): Suggestion[] {
        if (chips.length < 1 || currentInput === '') {
            return [];
        }
        if ('null'.startsWith(currentInput.toLocaleLowerCase())) {
            return [
                {
                    type: 'param',
                    value: null,
                    label: 'null',
                },
            ];
        }
        return [];
    }
}
