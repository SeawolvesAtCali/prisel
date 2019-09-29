import { SuggestionProvider } from './SuggestionProvider';
import Suggestion from '../Suggestion';

export default class BooleanProvider extends SuggestionProvider {
    constructor() {
        super('booleanProvider');
    }
    public getSuggestion(chips: Suggestion[], currentInput: string): Suggestion[] {
        if (chips.length < 1) {
            return [];
        }
        if (currentInput === '') {
            return [];
        }
        const lowercaseInput = currentInput.toLocaleLowerCase();
        if ('true'.startsWith(lowercaseInput)) {
            return [this.createParam('true', true, 'true')];
        }
        if ('false'.startsWith(lowercaseInput)) {
            return [this.createParam('false', false, 'false')];
        }
        return [];
    }
}
