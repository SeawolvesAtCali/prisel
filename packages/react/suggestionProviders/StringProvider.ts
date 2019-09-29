import { SuggestionProvider } from './SuggestionProvider';
import Suggestion from '../Suggestion';
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
        if (trimmed !== '') {
            return [this.createParam(this.getLabel(trimmed), trimmed, '')];
        }
        if (trimmed === '' && currentInput !== '') {
            return [this.createParam(this.getLabel(''), '', '')];
        }
        return [];
    }
    private getLabel(value: string) {
        return `'${value}'`;
    }
}
