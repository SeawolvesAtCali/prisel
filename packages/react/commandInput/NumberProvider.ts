import { SuggestionProvider } from './SuggestionProvider';
import { Suggestion } from './Chip';

export default class NumberProvider extends SuggestionProvider {
    public getSuggestion(chips: Suggestion[], currentInput: any): Suggestion[] {
        if (chips.length < 1) {
            return [];
        }
        if (currentInput.match(/^-?[0-9]+\.?[0-9]*$/)) {
            const num = parseFloat(currentInput);
            return [
                {
                    type: 'param',
                    value: num,
                    label: `${num}`,
                },
            ];
        }
        return [];
    }
}
