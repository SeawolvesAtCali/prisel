import React, { useState, useCallback } from 'react';
import CommandManager, { Command } from './commandManager';

export { default as CommandEditor } from './CommandEditor';
export function useCommandEditor(): [Command[], (title: string, script: string, tokens: string[]) => void] {
    const [commands, setCommands] = useState<Command[]>(CommandManager.getAll());

    const handleSaveCommand = useCallback((title: string, script: string, tokens: string[]) => {
        CommandManager.add(title, script, tokens);
        CommandManager.refresh();
        setCommands(CommandManager.getAll());
    }, []);

    return [commands, handleSaveCommand];
}
