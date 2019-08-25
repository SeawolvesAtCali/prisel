import { Suggestion } from './Chip';
import { Command } from '../commandEditor/commandManager';

export abstract class SuggestionProvider {
    public key: string;
    constructor(key: string) {
        this.key = key;
    }

    public abstract getSuggestion(chips: Suggestion[], currentInput: string): Suggestion[];

    public onSelected(
        suggestion: Suggestion,
        chips: Suggestion[],
        currentInput: string,
    ): Suggestion[] {
        return [suggestion];
    }

    private createSuggestion(type: Suggestion['type'], label: string, value: any): Suggestion {
        return {
            type,
            label,
            value,
            providerKey: this.key,
        };
    }

    protected createParam(label: string, value: any): Suggestion {
        return this.createSuggestion('param', label, value);
    }

    protected createCommand(label: string, command: Command): Suggestion {
        return this.createSuggestion('command', label, command);
    }

    protected createVariable(label: string): Suggestion {
        return this.createSuggestion('variableParam', `{${label}}`, label);
    }

    protected createPlaceholder(label: string): Suggestion {
        return this.createSuggestion('placeholderParam', label, label);
    }
}
