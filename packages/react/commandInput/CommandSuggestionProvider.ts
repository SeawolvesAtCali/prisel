import { SuggestionProvider } from './SuggestionProvider';
import { Suggestion } from './Chip';

export default class CommandSuggestionProvider extends SuggestionProvider {
    private commands: string[];
    constructor(commands) {
        super();
        this.commands = commands;
    }
    private toSuggestions(commands: string[]): Suggestion[] {
        return commands.map((command) => ({
            type: 'command',
            label: command,
            value: command,
        }));
    }
    public getSuggestion(chips: Suggestion[], currentInput: string): Suggestion[] {
        if (chips.length > 0) {
            return [];
        }
        if (currentInput === '') {
            return this.toSuggestions(this.commands);
        }
        const lowerCaseInput = currentInput.toLocaleLowerCase();
        return this.toSuggestions(
            this.commands.filter((command) =>
                command.toLocaleLowerCase().startsWith(lowerCaseInput),
            ),
        );
    }
    public onSelected(chips: Suggestion[], currentInput): Suggestion[] {
        return this.toSuggestions([
            this.commands.find((command) =>
                command.toLocaleLowerCase().startsWith(currentInput.toLocaleLowerCase),
            ),
        ]);
    }
}
