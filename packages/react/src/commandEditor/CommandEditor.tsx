import * as React from 'react';
import Dialog from './Dialog';
import Editor from 'react-simple-code-editor';
import compile from './InsecureEval';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import './highlight.css';
import styles from './style.module.css';
import { Command, isCommand } from './commandManager';
import { ToolbarItem } from '../Toolbar';
import { TypedCommand } from '../commands';

const regex = /\$([a-zA-Z_]+\w*)/g;

interface CardProps {
    children: React.ReactNode;
}
const Card: React.FC<CardProps> = ({ children }: CardProps) => {
    return <div>{children}</div>;
};

function getAllToken(code: string): string[] {
    return Array.from((code as any).matchAll(regex)).map((match: any) => match[1] as string);
}

export function execute(code: string, context: Map<string, any>) {
    const runner = compile(code);
    const object = runner(context);
    return object;
}

interface CommandEditorProp {
    savedCommands?: Array<Command | TypedCommand>;
    onSave?: (title: string, script: string, variables: string[]) => void;
}
function CommandEditor(props: CommandEditorProp) {
    const { onSave, savedCommands = [] } = props;
    const [open, setOpen] = React.useState(false);
    const [json, setJson] = React.useState('');
    const [error, setError] = React.useState('');
    const [tokens, setTokens] = React.useState<string[]>([]);
    const [title, setTitle] = React.useState('');

    const handleClose = React.useCallback(() => {
        setOpen(false);
    }, []);
    const handleOpen = React.useCallback(() => {
        setOpen(true);
    }, []);
    const handleJson = React.useCallback((code) => {
        setJson(code);
        setTokens(getAllToken(code));
    }, []);

    const handleSave = React.useCallback(() => {
        if (onSave && json && title) {
            onSave(title, json, tokens);
            setJson('');
            handleClose();
            return;
        }
        if (!title) {
            setError('Please enter a command name');
            return;
        }
        if (!title) {
            setError('Please enter a command');
            return;
        }
        handleClose();
    }, [json, tokens, title, handleClose, onSave]);

    const handleTitleChange = React.useCallback((e) => {
        setTitle(e.target.value);
    }, []);

    return (
        <React.Fragment>
            <ToolbarItem onClick={handleOpen}>Edit Command</ToolbarItem>
            <Dialog
                open={open}
                onClose={handleClose}
                containerClass={styles.commandEditorDialogContainer}
            >
                <Card>
                    {savedCommands.filter(isCommand).map((command) => (
                        <button
                            key={command.title}
                            onClick={() => {
                                setTitle(command.title);
                                setJson(command.code);
                            }}
                        >
                            {command.title}
                        </button>
                    ))}
                    <input onChange={handleTitleChange} />
                    <div className="command-editor-param-section">
                        {tokens.map((token) => (
                            <span>{token}</span>
                        ))}
                    </div>
                    <Editor
                        value={json}
                        onValueChange={handleJson}
                        highlight={(code) => highlight(code, languages.js, 'js')}
                        padding={10}
                        style={{
                            fontFamily: 'monospace',
                            fontSize: 12,
                            border: '1px solid lightgrey',
                        }}
                    />
                    {error}
                    <div className="command-editor-dialog-footer">
                        <button onClick={handleSave}>Save</button>
                        <button onClick={handleClose}>Cancel</button>
                    </div>
                </Card>
            </Dialog>
        </React.Fragment>
    );
}

export default CommandEditor;
