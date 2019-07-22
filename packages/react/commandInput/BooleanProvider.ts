import { SuggestionProvider } from './SuggestionProvider';
import { Suggestion } from './Chip';

export default class BooleanProvider extends SuggestionProvider {
    public getSuggestion(chips: Suggestion[], currentInput: string): Suggestion[] {
        if (chips.length < 1) {
            return [];
        }
        if (currentInput === '') {
            return [];
        }
        const lowercaseInput = currentInput.toLocaleLowerCase();
        if ('true'.startsWith(lowercaseInput)) {
            return [
                {
                    type: 'param',
                    value: true,
                    label: 'true',
                },
            ];
        }
        if ('false'.startsWith(lowercaseInput)) {
            return [
                {
                    type: 'param',
                    value: false,
                    label: 'false',
                },
            ];
        }
        return [];
    }
}
