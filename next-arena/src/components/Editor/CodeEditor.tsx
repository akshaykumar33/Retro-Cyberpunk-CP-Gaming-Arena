"use client";

import React, { useEffect, useState } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useEditor } from '@/context/EditorContext';

const CodeEditor = () => {
    const { code, setCode, theme, fontSize } = useEditor();
    const monaco = useMonaco();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (monaco) {
            // Define custom themes based on our CSS variables if needed
            // For now, mapping to built-in or basic custom
            if (theme === 'professional') {
                monaco.editor.setTheme('vs-dark'); 
            } else if (theme === 'cyberpunk') {
                monaco.editor.defineTheme('cyberpunk', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                        { token: 'comment', foreground: '00f3ff', fontStyle: 'italic' },
                        { token: 'keyword', foreground: 'ff00ff' }
                    ],
                    colors: {
                        'editor.background': '#050510',
                        'editor.foreground': '#ffffff',
                        'editorCursor.foreground': '#00f3ff',
                        'editor.lineHighlightBackground': '#0a0a1f',
                        'editorLineNumber.foreground': '#00f3ff'
                    }
                });
                monaco.editor.setTheme('cyberpunk');
            } else if (theme === 'synthwave') {
                monaco.editor.defineTheme('synthwave', {
                    base: 'vs-dark',
                    inherit: true,
                    rules: [
                        { token: 'comment', foreground: 'e0aaff', fontStyle: 'italic' },
                        { token: 'keyword', foreground: 'ff00ff', fontStyle: 'bold' },
                        { token: 'string', foreground: '00f3ff' },
                        { token: 'number', foreground: 'ffd700' }
                    ],
                    colors: {
                        'editor.background': '#120024',
                        'editor.foreground': '#ffffff',
                        'editorCursor.foreground': '#ff00ff',
                        'editor.lineHighlightBackground': '#240046',
                        'editorLineNumber.foreground': '#e0aaff'
                    }
                });
                monaco.editor.setTheme('synthwave');
            } else if (theme === 'light') {
                monaco.editor.setTheme('vs'); // Built-in light theme
            } else {
                monaco.editor.setTheme('vs-dark');
            }
        }
    }, [monaco, theme]);

    if (!mounted) return <div className="h-full w-full bg-zinc-900 animate-pulse" />;

    return (
        <div className="h-full w-full overflow-hidden rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm transition-all duration-300">
            <Editor
                height="100%"
                language="javascript"
                value={code}
                theme="vs-dark"
                onChange={(value) => setCode(value || '')}
                options={{
                    fontSize: fontSize,
                    fontFamily: "'Cascadia Code', 'Fira Code', Consolas, monospace",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    smoothScrolling: true,
                    padding: { top: 16 },
                    roundedSelection: true,
                    automaticLayout: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;
