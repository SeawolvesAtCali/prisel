import { SuggestionProvider } from './SuggestionProvider';
import { Suggestion } from './Chip';

export default class VariableProvider extends SuggestionProvider {
    private variables: string[];
    constructor(variables: string[]) {
        super();
        this.variables = variables;
    }
    private toSuggestion(variables: string[]): Suggestion[] {
        return variables.map((variable) => ({
            type: 'variableParam',
            value: variable,
            label: `{${variable}}`,
        }));
    }
    public getSuggestion(chips: Suggestion[], currentInput: string): Suggestion[] {
        if (chips.length < 1) {
            return [];
        }
        if (currentInput === '') {
            return this.toSuggestion(this.variables);
        }
        const lowerInput = currentInput.toLocaleLowerCase();
        return this.toSuggestion(
            this.variables.filter((variable) => variable.startsWith(lowerInput)),
        );
    }
}
