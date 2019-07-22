import { Suggestion } from './Chip';

export abstract class SuggestionProvider {
    public abstract getSuggestion(chips: Suggestion[], currentInput: string): Suggestion[];
}
