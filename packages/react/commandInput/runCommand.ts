import Suggestion from '../Suggestion';
import { Command } from '../commandEditor/commandManager';
import { execute } from '../commandEditor/CommandEditor';

export default function run(
    chips: Suggestion[],
    variableResolver: (key: string) => any,
    onRun: (chips: Suggestion[], json: object) => void,
) {
    if (chips.length === 0) {
        return;
    }
    const commandChip = chips[0];
    if (commandChip.type !== 'command') {
        return;
    }
    const command = commandChip.value as Command;
    if (command.tokens.length > chips.length - 1) {
        return;
    }
    let error = false;
    if (command.tokens.length > chips.length - 1) {
        error = true;
        console.error('cannot execute because there are some params missing');
    }
    const params: Array<[string, any]> = command.tokens.map((token, index) => {
        const paramChip = chips[index + 1];
        switch (paramChip.type) {
            case 'param':
                return ['$' + token, paramChip.value];
            case 'variableParam':
                return ['$' + token, variableResolver(paramChip.value)];
            default:
                error = true;
                return ['none', null];
        }
    });
    if (error) {
        return;
    }
    let object;
    try {
        object = execute(command.code, new Map(params));
    } catch (e) {
        console.error(e);
    }
    if (object) {
        onRun(chips, object);
    }
}
