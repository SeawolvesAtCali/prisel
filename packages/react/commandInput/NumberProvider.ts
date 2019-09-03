import { SuggestionProvider } from './SuggestionProvider';
import Suggestion from '../Suggestion';

export default class NumberProvider extends SuggestionProvider {
    constructor() {
        super('numberProvider');
    }
    public getSuggestion(chips: Suggestion[], currentInput: any): Suggestion[] {
        if (chips.length < 1) {
            return [];
        }
        if (currentInput.match(/^-?[0-9]+\.?[0-9]*$/)) {
            const num = parseFloat(currentInput);
            return [this.createParam(`${num}`, num, '')];
        }
        return [];
    }
}
