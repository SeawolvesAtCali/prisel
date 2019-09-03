import { SuggestionProvider } from './SuggestionProvider';
import Suggestion from '../Suggestion';

export default class VariableProvider extends SuggestionProvider {
    private variables: string[];
    constructor(variables: string[]) {
        super('variableProvider');
        this.variables = variables;
    }
    private toSuggestions(variables: string[]): Suggestion[] {
        return variables.map((variable) => this.createVariable(variable, variable));
    }
    public getSuggestion(chips: Suggestion[], currentInput: string): Suggestion[] {
        if (chips.length < 1) {
            return [];
        }
        if (currentInput === '') {
            return this.toSuggestions(this.variables);
        }
        const lowerInput = currentInput.toLocaleLowerCase();
        return this.toSuggestions(
            this.variables.filter((variable) => variable.startsWith(lowerInput)),
        );
    }
}
