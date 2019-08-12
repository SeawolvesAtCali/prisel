import { SuggestionProvider } from './SuggestionProvider';
import { Suggestion } from './Chip';
import { Command } from '../commandEditor/commandManager';

export default class CommandSuggestionProvider extends SuggestionProvider {
    private commands: Command[];

    constructor(commands: Command[]) {
        super('commandProvider');
        this.commands = commands;
    }
    private toSuggestions(commands: Command[]): Suggestion[] {
        return commands.map((command) => this.createCommand(command.title, command));
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
                command.title.toLocaleLowerCase().startsWith(lowerCaseInput),
            ),
        );
    }
    public onSelected(
        suggestion: Suggestion,
        chips: Suggestion[],
        currentInput: string,
    ): Suggestion[] {
        const command: Command = suggestion.value;
        return [
            this.createCommand(suggestion.label, command),
            ...command.tokens.map((token) => this.createPlaceholder(token)),
        ];
    }
}
