import Suggestion from '../Suggestion';
import { isCommand } from '../commandEditor/commandManager';
import { execute } from '../commandEditor/CommandEditor';
import { Packet } from '@prisel/client';
import { isTypedCommand } from '../commands';

export default function run(
    chips: Suggestion[],
    variableResolver: (key: string) => any,
    onRun: (json: Packet) => void,
) {
    if (chips.length === 0) {
        return;
    }
    const commandChip = chips[0];
    if (commandChip.type !== 'command') {
        return;
    }
    if (!isCommand(commandChip.value) && !isTypedCommand(commandChip.value)) {
        return;
    }
    const command = commandChip.value;
    if (command.tokens.length > chips.length - 1) {
        // tslint:disable-next-line:no-console
        console.error('cannot execute because there are some params missing');
        return;
    }
    const paramMap = new Map<string, any>();
    const tokens = command.tokens;
    for (let index = 0; index < tokens.length; index++) {
        const paramChip = chips[index + 1];
        const referenceKey = '$' + tokens[index];
        switch (paramChip.type) {
            case 'param':
                paramMap.set(referenceKey, paramChip.value);
                break;
            case 'variableParam':
                paramMap.set(referenceKey, variableResolver(paramChip.value));
                break;
            default:
                // not supported, return.
                return;
        }
    }

    let object;
    if (isTypedCommand(command)) {
        object = command.code(...Array.from(paramMap.values()));
    } else {
        try {
            object = execute(command.code, paramMap);
        } catch (e) {
            // tslint:disable-next-line:no-console
            console.error(e);
        }
    }
    if (object) {
        onRun(object);
    }
}
