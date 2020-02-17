import { useState, useCallback } from 'react';
import CommandManager, { Command } from './commandManager';
import { TypedCommand } from '../commands';

export { default as CommandEditor } from './CommandEditor';
export function useCommandEditor(): [
    Array<Command | TypedCommand>,
    (title: string, script: string, tokens: string[]) => void,
] {
    const [commands, setCommands] = useState(CommandManager.getAll());

    const handleSaveCommand = useCallback((title: string, script: string, tokens: string[]) => {
        CommandManager.add(title, script, tokens);
        setCommands(CommandManager.getAll());
    }, []);

    return [commands, handleSaveCommand];
}
