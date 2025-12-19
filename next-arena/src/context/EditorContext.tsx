"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'professional' | 'cyberpunk' | 'nature' | 'midnight' | 'synthwave' | 'light';
export type DisplayMode = 'standard' | 'zen';

interface LogEntry {
  type: 'stdout' | 'stderr' | 'info' | 'success' | 'warning';
  message: string;
  timestamp: string;
}

interface EditorContextProps {
  code: string;
  setCode: (code: string) => void;
  input: string;
  setInput: (input: string) => void;
  output: LogEntry[];
  appendOutput: (type: LogEntry['type'], message: string) => void;
  clearOutput: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  mode: DisplayMode;
  setMode: (mode: DisplayMode) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  autoRun: boolean;
  setAutoRun: (autoRun: boolean) => void;
  runtime: 'node' | 'browser';
  setRuntime: (runtime: 'node' | 'browser') => void;
}

const EditorContext = createContext<EditorContextProps | undefined>(undefined);

const DEFAULT_CODE_NODE = `// Node.js Runtime
const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello Node.js!');
});
console.log('Server setup complete...');`;

const DEFAULT_CODE_BROWSER = `// Browser Runtime
const header = document.querySelector('h1');
console.log('Header text:', header ? header.innerText : 'Not found');
alert('Hello from Browser!');`;

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [code, setCode] = useState(DEFAULT_CODE_NODE);
  const [runtime, setRuntime] = useState<'node' | 'browser'>('node');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<LogEntry[]>([]);
  const [theme, setTheme] = useState<Theme>('professional'); // professional is default
  const [mode, setMode] = useState<DisplayMode>('standard');
  const [fontSize, setFontSize] = useState(14);
  const [autoRun, setAutoRun] = useState(false);

  // Hydrate from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('arena_theme') as Theme;
    if (savedTheme) setTheme(savedTheme);
    
    const savedCode = localStorage.getItem('arena_code');
    if (savedCode) setCode(savedCode);
  }, []);

  // Persist
  useEffect(() => {
    localStorage.setItem('arena_theme', theme);
  }, [theme]);
  
  useEffect(() => {
    localStorage.setItem('arena_code', code);
  }, [code]);

  const appendOutput = (type: LogEntry['type'], message: string) => {
    const entry: LogEntry = {
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    };
    setOutput(prev => [...prev.slice(-999), entry]); // Keep last 1000 logs
  };

  const clearOutput = () => setOutput([]);

  return (
    <EditorContext.Provider value={{
      code, setCode,
      input, setInput,
      output, appendOutput, clearOutput,
      theme, setTheme,
      mode, setMode,
      fontSize, setFontSize,
      autoRun, setAutoRun,
      runtime, setRuntime
    }}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) throw new Error("useEditor must be used within EditorProvider");
  return context;
};
