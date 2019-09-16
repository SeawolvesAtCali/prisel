import Suggestion from '../Suggestion';
import { Command } from '../commandEditor/commandManager';
import { execute } from '../commandEditor/CommandEditor';
import { Packet, isPacket } from '@prisel/common';

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
    const command = commandChip.value as Command;
    if (command.tokens.length > chips.length - 1) {
        return;
    }
    let error = false;
    if (command.tokens.length > chips.length - 1) {
        error = true;
        // tslint:disable-next-line:no-console
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
        // tslint:disable-next-line:no-console
        console.error(e);
    }
    if (object && isPacket(object)) {
        onRun(object);
    }
}
