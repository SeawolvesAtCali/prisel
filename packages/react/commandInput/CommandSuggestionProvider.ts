import { SuggestionProvider } from './SuggestionProvider';
import { Suggestion } from './Chip';
import { Command, CommandManager } from '../commandEditor/commandManager';

export default class CommandSuggestionProvider extends SuggestionProvider {
    private commandManager: CommandManager;

    constructor(commandManager: CommandManager) {
        super('commandProvider');
        this.commandManager = commandManager;
    }
    private toSuggestions(commands: Command[]): Suggestion[] {
        return commands.map((command) => this.createCommand(command.title, command));
    }
    public getSuggestion(chips: Suggestion[], currentInput: string): Suggestion[] {
        if (chips.length > 0) {
            return [];
        }
        const allCommands = this.commandManager.getAll();
        if (currentInput === '') {
            return this.toSuggestions(allCommands);
        }
        const lowerCaseInput = currentInput.toLocaleLowerCase();
        return this.toSuggestions(
            allCommands.filter((command) =>
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
