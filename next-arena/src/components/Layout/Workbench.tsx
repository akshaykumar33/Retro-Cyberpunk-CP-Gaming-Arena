"use client";

import React from 'react';
import CodeEditor from '../Editor/CodeEditor';
import { useEditor } from '@/context/EditorContext';
import { Terminal, Play, Trash2, Maximize2, Minimize2, Upload, Moon, Sun, Leaf } from 'lucide-react';

const Workbench = () => {
    const { 
        output, appendOutput, clearOutput, 
        theme, setTheme, 
        mode, setMode,
        autoRun
    } = useEditor();

    const handleRun = () => {
        appendOutput('info', '🚀 Running code...');
        // Simulation of run
        setTimeout(() => {
            appendOutput('stdout', 'Analyzing input parameters...');
            appendOutput('stdout', 'Calculation complete.');
            appendOutput('success', 'Result: 42.00');
        }, 500);
    };

    const [isThemeOpen, setIsThemeOpen] = React.useState(false);

    const toggleRuntime = () => {
        setRuntime(runtime === 'node' ? 'browser' : 'node');
    };

    return (
        <div className={`flex h-screen w-full flex-col overflow-hidden text-[var(--color-foreground)] transition-colors duration-500`} data-theme={theme}>
            {/* Header */}
            {mode === 'standard' && (
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-glass)] px-4 backdrop-blur-md md:px-6">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-opacity-20 transition-colors ${runtime === 'node' ? 'bg-green-500 text-green-400' : 'bg-yellow-500 text-yellow-400'}`}>
                            <Terminal size={18} />
                        </div>
                        <h1 className="hidden text-lg font-bold tracking-tight md:block">
                            {runtime === 'node' ? 'Node.js' : 'JS'} Arena
                        </h1>
                        
                        {/* Runtime Toggle */}
                        <button 
                            onClick={toggleRuntime}
                            className="ml-4 flex items-center gap-1 rounded-full border border-[var(--border-color)] bg-white/5 px-3 py-1 text-xs font-medium hover:bg-white/10"
                        >
                            <span className={runtime === 'node' ? 'text-green-400' : 'text-zinc-500'}>Node</span>
                            <span className="text-zinc-600">/</span>
                            <span className={runtime === 'browser' ? 'text-yellow-400' : 'text-zinc-500'}>Browser</span>
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-2 md:gap-4">
                       <button 
                            onClick={() => handleRun()}
                            className="flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500 active:translate-y-0.5 md:px-4"
                        >
                            <Play size={14} fill="currentColor" /> <span className="hidden sm:inline">Run</span>
                        </button>

                       <div className="hidden h-6 w-px bg-white/10 sm:block" />

                       {/* Theme Dropdown */}
                       <div className="relative">
                            <button 
                                onClick={() => setIsThemeOpen(!isThemeOpen)}
                                className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]"
                            >
                                <span>Theme</span>
                                <ChevronDown size={14} />
                            </button>

                            {isThemeOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsThemeOpen(false)} />
                                    <div className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-xl backdrop-blur-xl">
                                        <div className="p-1">
                                            {[
                                                { id: 'professional', label: 'Professional', icon: Moon, color: 'text-zinc-400' },
                                                { id: 'light', label: 'Light', icon: Sun, color: 'text-yellow-400' },
                                                { id: 'nature', label: 'Nature', icon: Leaf, color: 'text-green-400' },
                                                { id: 'cyberpunk', label: 'Cyberpunk', icon: Maximize2, color: 'text-cyan-400' },
                                                { id: 'synthwave', label: 'Synthwave', icon: Terminal, color: 'text-purple-400' },
                                            ].map((t) => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => { setTheme(t.id as any); setIsThemeOpen(false); }}
                                                    className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${theme === t.id ? 'bg-blue-600/10 text-blue-400' : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]'}`}
                                                >
                                                    <t.icon size={14} className={t.color} />
                                                    {t.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                       </div>

                       <div className="hidden h-6 w-px bg-white/10 sm:block" />
                       
                       <button 
                            onClick={() => setMode('zen')}
                            className="hidden text-zinc-500 hover:text-white sm:block"
                            title="Zen Mode"
                        >
                            <Minimize2 size={18} />
                       </button>
                    </div>
                </header>
            )}

            {/* Main Workspace */}
            <main className="flex flex-1 flex-col gap-4 overflow-hidden p-2 md:flex-row md:p-4">
                {/* Editor Area */}
                <div className="relative flex min-h-[50%] min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-glass)] shadow-2xl backdrop-blur-sm transition-all md:h-auto">
                    {mode === 'zen' && (
                        <button 
                            onClick={() => setMode('standard')}
                            className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white/50 hover:bg-white/20 hover:text-white"
                        >
                            <Maximize2 size={16} />
                        </button>
                    )}
                    <CodeEditor />
                </div>
                
                {/* Output/IO Area - Hidden in Zen Mode if desired, or simpler */}
                {mode === 'standard' && (
                    <div className="flex w-full flex-col gap-4 md:w-[30%] md:min-w-[300px]">
                       
                        {/* Console */}
                        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-glass)] shadow-2xl backdrop-blur-sm">
                            <div className="flex items-center justify-between border-b border-[var(--border-color)] px-4 py-2 bg-white/5">
                                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Console</span>
                                <button onClick={clearOutput} className="text-[var(--text-secondary)] hover:text-red-400">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
                                {output.length === 0 && (
                                    <div className="mt-10 text-center text-white/20">
                                        <Terminal size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>Ready to execute...</p>
                                    </div>
                                )}
                                {output.map((log, i) => (
                                    <div key={i} className="mb-2 border-l-2 border-transparent pl-2"
                                         style={{ 
                                             borderColor: log.type === 'stderr' ? '#ef4444' : log.type === 'success' ? '#22c55e' : 'transparent',
                                             color: log.type === 'stderr' ? '#fca5a5' : log.type === 'success' ? '#86efac' : 'inherit'
                                         }}>
                                        <span className="mr-2 opacity-30">[{log.timestamp}]</span>
                                        <span>{log.message}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                         {/* Input / Upload */}
                         <div className="h-1/3 min-h-[150px] overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-glass)] p-4 shadow-xl backdrop-blur-sm">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Input Data</span>
                                <label className="cursor-pointer text-[var(--accent-primary)] hover:text-white">
                                    <Upload size={14} />
                                    <input type="file" className="hidden" />
                                </label>
                            </div>
                            <textarea 
                                className="h-full w-full resize-none bg-transparent text-sm font-mono text-[var(--text-primary)] outline-none placeholder:text-white/20"
                                placeholder="Enter input for stdin..."
                            />
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Workbench;
