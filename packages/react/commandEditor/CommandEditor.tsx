import * as React from 'react';
import { Card, Input, Button, Mentions } from 'antd';
import Dialog from './Dialog';
import Editor from 'react-simple-code-editor';
import compile from './InsecureEval';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import './highlight.css';
import './style.css';
import { Command } from './commandManager';

const regex = /\$([a-zA-Z_]+\w*)/g;

function getAllToken(code: string): string[] {
    return Array.from((code as any).matchAll(regex)).map((match: any) => match[1] as string);
}

export function execute(code: string, context: Map<string, any>) {
    const runner = compile(code);
    const object = runner(context);
    return object;
}

interface CommandEditorProp {
    savedCommands?: Command[];
    onSave?: (title: string, script: string, variables: string[]) => void;
}
function CommandEditor(props: CommandEditorProp) {
    const { onSave, savedCommands = [] } = props;
    const [open, setOpen] = React.useState(false);
    const [json, setJson] = React.useState('');
    const [error, setError] = React.useState('');
    const [tokens, setTokens] = React.useState([]);
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
    }, [json, tokens, title]);

    const handleTitleChange = React.useCallback((e) => {
        setTitle(e.target.value);
    }, []);

    return (
        <React.Fragment>
            <Button onClick={handleOpen}>Edit Command</Button>
            <Dialog open={open} onClose={handleClose}>
                <Card title="Command Editor" style={{ width: 500 }}>
                    {savedCommands.map((command) => (
                        <Button
                            key={command.title}
                            onClick={() => {
                                setTitle(command.title);
                                setJson(command.code);
                            }}
                        >
                            {command.title}
                        </Button>
                    ))}
                    <Input addonBefore="Command" onChange={handleTitleChange} />
                    <div className="command-editor-param-section">
                        {tokens.map((token) => (
                            <span>{token}</span>
                        ))}
                    </div>
                    <Editor
                        value={json}
                        onValueChange={handleJson}
                        highlight={(code) => highlight(code, languages.js)}
                        padding={10}
                        style={{
                            fontFamily: 'monospace',
                            fontSize: 12,
                            border: '1px solid lightgrey',
                        }}
                    />
                    {error}
                    <div className="command-editor-dialog-footer">
                        <Button type="primary" onClick={handleSave}>
                            Save
                        </Button>
                        <Button onClick={handleClose}>Cancel</Button>
                    </div>
                </Card>
            </Dialog>
        </React.Fragment>
    );
}

export default CommandEditor;
