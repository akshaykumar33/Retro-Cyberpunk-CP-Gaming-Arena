// Node.js Code Editor Application
class NodeJSCodeEditor {
    constructor() {
        this.editor = null;
        this.executionTimeout = null;
        this.isExecuting = false;
        this.outputLineCount = 0;
        this.maxOutputLines = 1000;
        
        this.defaultCode = `// Node.js Code Editor
// Write your Node.js code here

// Example: Process array of numbers
function processArray(arr) {
    return arr.map(num => num * 2);
}

// Read input (simulated stdin)
const input = "1 2 3 4 5";
const numbers = input.split(' ').map(Number);

// Process and display output
const result = processArray(numbers);
console.log('Input:', numbers);
console.log('Output:', result);
console.log('Sum:', result.reduce((a, b) => a + b, 0));`;
        
        this.init();
    }

    async init() {
        this.showLoadingModal();
        await this.initMonacoEditor();
        this.initEventListeners();
        this.hideLoadingModal();
        
        // Set focus to editor
        setTimeout(() => {
            if (this.editor) {
                this.editor.focus();
            }
        }, 100);
    }

    showLoadingModal() {
        document.getElementById('loading-modal').classList.remove('hidden');
    }

    hideLoadingModal() {
        document.getElementById('loading-modal').classList.add('hidden');
    }

    async initMonacoEditor() {
        return new Promise((resolve, reject) => {
            require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs' }});
            
            require(['vs/editor/editor.main'], () => {
                try {
                    // Configure Monaco for JavaScript
                    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                        noSemanticValidation: false,
                        noSyntaxValidation: false,
                    });

                    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                        target: monaco.languages.typescript.ScriptTarget.ES2020,
                        allowNonTsExtensions: true,
                        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                        module: monaco.languages.typescript.ModuleKind.CommonJS,
                        noEmit: true,
                        esModuleInterop: true,
                        jsx: monaco.languages.typescript.JsxEmit.React,
                        reactNamespace: 'React',
                        allowJs: true,
                        typeRoots: ['node_modules/@types']
                    });

                    // Create editor
                    this.editor = monaco.editor.create(document.getElementById('monaco-editor'), {
                        value: this.defaultCode,
                        language: 'javascript',
                        theme: 'vs-dark',
                        fontSize: 14,
                        fontFamily: 'Monaco, Consolas, Courier New, monospace',
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        insertSpaces: true,
                        wordWrap: 'on',
                        minimap: { enabled: true, scale: 0.5 },
                        suggestOnTriggerCharacters: true,
                        quickSuggestions: true,
                        parameterHints: { enabled: true },
                        bracketMatching: 'always',
                        autoIndent: 'full',
                        formatOnPaste: true,
                        formatOnType: true
                    });

                    // Add Ctrl+Enter keybinding for running code
                    this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
                        this.runCode();
                    });

                    // Add theme change listener
                    this.editor.onDidChangeConfiguration(() => {
                        this.updateEditorTheme();
                    });

                    resolve();
                } catch (error) {
                    console.error('Monaco Editor initialization failed:', error);
                    reject(error);
                }
            });
        });
    }

    initEventListeners() {
        // Button event listeners
        document.getElementById('run-btn').addEventListener('click', () => this.runCode());
        document.getElementById('clear-output-btn').addEventListener('click', () => this.clearOutput());
        document.getElementById('clear-editor-btn').addEventListener('click', () => this.clearEditor());
        document.getElementById('download-btn').addEventListener('click', () => this.downloadCode());
        document.getElementById('clear-console-btn').addEventListener('click', () => this.clearOutput());
        
        // Theme selector
        document.getElementById('theme-selector').addEventListener('change', (e) => {
            this.changeEditorTheme(e.target.value);
        });
        
        // Sample input selector
        document.getElementById('sample-input').addEventListener('change', (e) => {
            const inputArea = document.getElementById('input-area');
            if (e.target.value) {
                inputArea.value = e.target.value;
                e.target.selectedIndex = 0; // Reset selector
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.runCode();
            }
        });
    }

    changeEditorTheme(theme) {
        if (this.editor) {
            monaco.editor.setTheme(theme);
        }
    }

    updateEditorTheme() {
        // This method can be used to sync theme changes
    }

    async runCode() {
        if (this.isExecuting) {
            this.appendOutput('⚠️ Code is already running...', 'warning');
            return;
        }

        const code = this.editor.getValue().trim();
        if (!code) {
            this.appendOutput('❌ No code to execute. Please write some code first.', 'error');
            return;
        }

        this.isExecuting = true;
        this.setExecutionStatus('running', 'Running...');
        this.clearOutput();
        
        const startTime = performance.now();
        
        try {
            await this.executeNodeJSCode(code);
            const endTime = performance.now();
            const executionTime = ((endTime - startTime) / 1000).toFixed(3);
            
            this.setExecutionStatus('completed', 'Completed');
            this.setExecutionTime(`Executed in ${executionTime}s`);
            
        } catch (error) {
            const endTime = performance.now();
            const executionTime = ((endTime - startTime) / 1000).toFixed(3);
            
            this.setExecutionStatus('error', 'Error');
            this.setExecutionTime(`Failed in ${executionTime}s`);
            this.appendOutput(`❌ Runtime Error: ${error.message}`, 'error');
            
            if (error.stack) {
                this.appendOutput(error.stack, 'error');
            }
        } finally {
            this.isExecuting = false;
            if (this.executionTimeout) {
                clearTimeout(this.executionTimeout);
                this.executionTimeout = null;
            }
        }
    }

    async executeNodeJSCode(code) {
        return new Promise((resolve, reject) => {
            // Set timeout
            this.executionTimeout = setTimeout(() => {
                reject(new Error('Execution timeout: Code took longer than 5 seconds'));
            }, 5000);

            try {
                // Get input from textarea
                const inputText = document.getElementById('input-area').value || '';
                
                // Create sandbox environment
                const sandbox = this.createNodeJSSandbox(inputText);
                
                // Wrap code in try-catch for better error handling
                const wrappedCode = `
                    try {
                        ${code}
                    } catch (error) {
                        console.error(error.message);
                        throw error;
                    }
                `;

                // Execute code in sandbox
                const executeCode = new Function(
                    'console', 'process', 'require', 'module', 'exports', '__dirname', '__filename',
                    'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
                    wrappedCode
                );

                executeCode(
                    sandbox.console,
                    sandbox.process,
                    sandbox.require,
                    sandbox.module,
                    sandbox.exports,
                    sandbox.__dirname,
                    sandbox.__filename,
                    setTimeout,
                    setInterval,
                    clearTimeout,
                    clearInterval
                );

                // Wait a bit for async operations
                setTimeout(() => {
                    resolve();
                }, 100);
                
            } catch (error) {
                reject(error);
            }
        });
    }

    createNodeJSSandbox(inputText) {
        const self = this;
        const inputLines = inputText.split('\n');
        let inputIndex = 0;

        // Mock console object
        const mockConsole = {
            log: (...args) => {
                const message = args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ');
                self.appendOutput(message, 'stdout');
            },
            error: (...args) => {
                const message = args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ');
                self.appendOutput(message, 'stderr');
            },
            warn: (...args) => {
                const message = args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ');
                self.appendOutput(`⚠️ ${message}`, 'warning');
            },
            info: (...args) => {
                const message = args.map(arg => 
                    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
                ).join(' ');
                self.appendOutput(`ℹ️ ${message}`, 'info');
            },
            clear: () => {
                self.clearOutput();
            }
        };

        // Mock process object
        const mockProcess = {
            stdin: {
                read: () => inputText,
                on: (event, callback) => {
                    if (event === 'data') {
                        // Simulate data events for each line
                        inputLines.forEach((line, index) => {
                            setTimeout(() => callback(line + '\n'), index * 10);
                        });
                    }
                }
            },
            stdout: {
                write: (data) => mockConsole.log(data)
            },
            stderr: {
                write: (data) => mockConsole.error(data)
            },
            argv: ['node', 'script.js'],
            env: { NODE_ENV: 'development' },
            cwd: () => '/workspace',
            exit: (code) => {
                self.appendOutput(`Process exited with code ${code}`, code === 0 ? 'success' : 'error');
            }
        };

        // Mock require function
        const mockRequire = (moduleName) => {
            const mockModules = {
                'readline': {
                    createInterface: (options) => ({
                        question: (prompt, callback) => {
                            self.appendOutput(prompt, 'info');
                            const line = inputLines[inputIndex] || '';
                            inputIndex++;
                            setTimeout(() => callback(line), 10);
                        },
                        close: () => {}
                    })
                },
                'fs': {
                    readFileSync: (path) => {
                        throw new Error('File system access not available in browser environment');
                    },
                    writeFileSync: (path, data) => {
                        self.appendOutput(`[FS] Would write to ${path}: ${data}`, 'info');
                    }
                },
                'path': {
                    join: (...paths) => paths.join('/'),
                    resolve: (...paths) => '/' + paths.join('/'),
                    dirname: (path) => path.split('/').slice(0, -1).join('/'),
                    basename: (path) => path.split('/').pop(),
                    extname: (path) => {
                        const parts = path.split('.');
                        return parts.length > 1 ? '.' + parts.pop() : '';
                    }
                },
                'os': {
                    platform: () => 'browser',
                    arch: () => 'javascript',
                    cpus: () => [{ model: 'Browser Engine', speed: 3000 }],
                    totalmem: () => 8 * 1024 * 1024 * 1024,
                    freemem: () => 4 * 1024 * 1024 * 1024
                },
                'crypto': {
                    randomBytes: (size) => {
                        const bytes = new Uint8Array(size);
                        for (let i = 0; i < size; i++) {
                            bytes[i] = Math.floor(Math.random() * 256);
                        }
                        return bytes;
                    }
                }
            };

            if (mockModules[moduleName]) {
                return mockModules[moduleName];
            } else {
                throw new Error(`Module '${moduleName}' not available in browser environment`);
            }
        };

        return {
            console: mockConsole,
            process: mockProcess,
            require: mockRequire,
            module: { exports: {} },
            exports: {},
            __dirname: '/workspace',
            __filename: '/workspace/script.js'
        };
    }

    appendOutput(message, type = 'stdout') {
        if (this.outputLineCount >= this.maxOutputLines) {
            this.clearOutput();
            this.appendOutput('⚠️ Output cleared due to line limit (1000 lines)', 'warning');
        }

        const console = document.getElementById('output-console');
        const timestamp = new Date().toLocaleTimeString();
        
        const line = document.createElement('div');
        line.className = `console-line console-${type}`;
        
        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'console-timestamp';
        timestampSpan.textContent = `[${timestamp}] `;
        
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        
        line.appendChild(timestampSpan);
        line.appendChild(messageSpan);
        console.appendChild(line);
        
        // Auto-scroll to bottom
        console.scrollTop = console.scrollHeight;
        
        this.outputLineCount++;
    }

    clearOutput() {
        const console = document.getElementById('output-console');
        console.innerHTML = `
            <div class="console-welcome">
                <span class="console-prompt">$</span> Node.js Code Editor Console
                <div class="console-info">Console cleared. Ready for new output.</div>
            </div>
        `;
        this.outputLineCount = 0;
        this.setExecutionTime('');
    }

    clearEditor() {
        if (confirm('Are you sure you want to clear the editor? This action cannot be undone.')) {
            this.editor.setValue('');
            this.editor.focus();
        }
    }

    downloadCode() {
        const code = this.editor.getValue();
        const blob = new Blob([code], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `nodejs-code-${Date.now()}.js`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.appendOutput('✅ Code downloaded successfully!', 'success');
    }

    setExecutionStatus(type, message) {
        const status = document.getElementById('execution-status');
        status.className = `execution-status ${type}`;
        status.textContent = message;
    }

    setExecutionTime(time) {
        document.getElementById('execution-time').textContent = time;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NodeJSCodeEditor();
});