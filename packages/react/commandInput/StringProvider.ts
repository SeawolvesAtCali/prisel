import { SuggestionProvider } from './SuggestionProvider';
import { Suggestion } from './Chip';

export default class StringProvider extends SuggestionProvider {
    public getSuggestion(chips: Suggestion[], currentInput: any): Suggestion[] {
        if (chips.length < 1) {
            return [];
        }
        return [{ type: 'param', value: currentInput, label: this.getLabel(currentInput) }];
    }
    private getLabel(value) {
        return `"${value}"`;
    }
}
