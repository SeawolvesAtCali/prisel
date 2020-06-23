import Suggestion from '../Suggestion';
import { Command } from '../commandEditor/commandManager';
import { TypedCommand } from '../commands';

export abstract class SuggestionProvider {
    public key: string;
    private static count = 0;
    constructor(key: string) {
        this.key = key;
    }

    public abstract getSuggestion(chips: Suggestion[], currentInput: string): Suggestion[];

    protected getUniqueKey(): string {
        SuggestionProvider.count++;
        return SuggestionProvider.count + '';
    }
    public onSelected(
        suggestion: Suggestion,
        chips: Suggestion[],
        currentInput: string,
    ): Suggestion[] {
        return [{ ...suggestion, key: this.getUniqueKey() }];
    }

    private createSuggestion(
        type: Suggestion['type'],
        label: string,
        value: any,
        key?: string,
    ): Suggestion {
        return {
            type,
            label,
            value,
            providerKey: this.key,
            key,
        };
    }

    protected createParam(label: string, value: any, key?: string): Suggestion {
        return this.createSuggestion('param', label, value, key);
    }

    protected createCommand(label: string, command: Command | TypedCommand): Suggestion {
        return this.createSuggestion('command', label, command, command.title);
    }

    protected createVariable(label: string, key?: string): Suggestion {
        return this.createSuggestion('variableParam', `{${label}}`, label, key);
    }

    protected createPlaceholder(label: string, key?: string): Suggestion {
        return this.createSuggestion('placeholderParam', label, label, key);
    }
}
