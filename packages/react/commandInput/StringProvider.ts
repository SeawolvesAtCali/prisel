import { SuggestionProvider } from './SuggestionProvider';
import { Suggestion } from './Chip';
import trim from 'lodash/trim';

export default class StringProvider extends SuggestionProvider {
    constructor() {
        super('stringProvider');
    }
    public getSuggestion(chips: Suggestion[], currentInput: any): Suggestion[] {
        if (chips.length < 1) {
            return [];
        }
        const trimmed = trim(currentInput, `'"`);
        return [this.createParam(this.getLabel(trimmed), trimmed)];
    }
    private getLabel(value) {
        return `'${value}'`;
    }
}
