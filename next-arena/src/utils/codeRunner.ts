export type LogType = 'stdout' | 'stderr' | 'info' | 'success' | 'warning';

export interface ExecutionResult {
    logs: { type: LogType; message: string; timestamp: string }[];
}

export const runCode = async (code: string, inputData: string): Promise<ExecutionResult> => {
    const logs: { type: LogType; message: string; timestamp: string }[] = [];

    const log = (type: LogType, ...args: any[]) => {
        logs.push({
            type,
            message: args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '),
            timestamp: new Date().toLocaleTimeString()
        });
    };

    // Polyfills for Node.js environment
    const mockFs = {
        readFileSync: (path: any, options?: any) => {
            // Support fs.readFileSync(0) or fs.readFileSync('/dev/stdin')
            if (path === 0 || path === '/dev/stdin') {
                return inputData;
            }
            throw new Error(`Security Error: Cannot read file "${path}". Only stdin (0) is supported in this playground.`);
        }
    };

    const mockProcess = {
        stdin: {
            fd: 0,
            read: () => inputData,
            on: () => { }, // No-op for event listeners
            resume: () => { },
        },
        stdout: {
            write: (str: string) => log('stdout', str)
        },
        stderr: {
            write: (str: string) => log('stderr', str)
        },
        env: {}
    };

    const mockConsole = {
        ...console,
        log: (...args: any[]) => log('stdout', ...args),
        error: (...args: any[]) => log('stderr', ...args),
        warn: (...args: any[]) => log('warning', ...args),
        info: (...args: any[]) => log('info', ...args),
    };

    // Wrap code in a function to isolate scope and inject mocks
    // using "with" block is deprecated/strict mode incompatible, so we use Function constructor with arguments

    try {
        // We can't easily use 'require' dynamically in browser without a bundler mapping.
        // But for CP, usually 'fs' is the only one.
        // We'll mock 'require' to return our specific mocks.

        const mockRequire = (moduleName: string) => {
            if (moduleName === 'fs') return mockFs;
            // Add other common CP modules if needed, e.g., 'readline'
            if (moduleName === 'readline') return {
                createInterface: ({ input }: any) => {
                    // Very basic readline mock for common CP pattern
                    let lines = inputData.split('\n');
                    let idx = 0;
                    return {
                        on: (event: string, cb: Function) => {
                            if (event === 'line') {
                                lines.forEach(line => cb(line));
                            } else if (event === 'close') {
                                cb();
                            }
                        }
                    };
                }
            };
            return {}; // Return empty object for others to prevent crash
        };

        // Construct the function body
        // We inject mocks as variables available in the scope
        const runFunction = new Function(
            'require',
            'process',
            'console',
            'fs', // Also inject fs directly for convenience if they don't require it (rare but possible in some envs)
            `
            try {
                ${code}
            } catch (err) {
                console.error(err);
            }
            `
        );

        // Execute
        runFunction(mockRequire, mockProcess, mockConsole, mockFs);

    } catch (error: any) {
        log('stderr', error.toString());
    }

    return { logs };
};
