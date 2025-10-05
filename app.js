// 🎮 CP ARENA - RETRO CYBERPUNK GAMING ENGINE 🎮
// Advanced Competitive Programming Arcade Environment

// Game State Management
class GameState {
    constructor() {
        this.player = {
            level: 1,
            xp: 0,
            score: 0,
            rank: 'BRONZE',
            streak: 0,
            totalRuns: 0,
            successfulRuns: 0,
            codeLines: 0,
            sessionTime: 0
        };
        
        this.achievements = [
            {id: "first_run", name: "First Blood", desc: "Execute your first code", icon: "🚀", unlocked: false},
            {id: "speed_demon", name: "Speed Demon", desc: "Solve in under 60 seconds", icon: "⚡", unlocked: false},
            {id: "bug_hunter", name: "Bug Hunter", desc: "Fix 10 syntax errors", icon: "🐛", unlocked: false},
            {id: "marathon", name: "Marathon Runner", desc: "Code for 1+ hours", icon: "🏃", unlocked: false},
            {id: "perfectionist", name: "Perfectionist", desc: "100% test case pass rate", icon: "💯", unlocked: false},
            {id: "night_owl", name: "Night Owl", desc: "Code after midnight", icon: "🦉", unlocked: false},
            {id: "combo_master", name: "Combo Master", desc: "5 successful runs in a row", icon: "🔥", unlocked: false},
            {id: "code_ninja", name: "Code Ninja", desc: "Use advanced algorithms", icon: "🥷", unlocked: false},
            {id: "line_master", name: "Line Master", desc: "Write 1000+ lines of code", icon: "📝", unlocked: false},
            {id: "efficiency", name: "Efficiency Expert", desc: "Optimize code complexity", icon: "⚙️", unlocked: false}
        ];
        
        this.currentEnvironment = 'nodejs';
        this.timer = { running: false, startTime: 0, elapsed: 0 };
        this.lastRunTime = 0;
        this.sessionStartTime = Date.now();
    }

    // XP and Level Management
    addXP(amount, reason = '') {
        this.player.xp += amount;
        this.updateLevel();
        this.updateUI();
        this.showNotification(`+${amount} XP ${reason}`, 'success');
        this.checkAchievements();
    }

    updateLevel() {
        const newLevel = Math.floor(this.player.xp / 1000) + 1;
        if (newLevel > this.player.level) {
            this.player.level = newLevel;
            this.showLevelUp(newLevel);
            this.addScore(500); // Level up bonus
        }
        this.updateRank();
    }

    updateRank() {
        const score = this.player.score;
        if (score >= 100000) this.player.rank = 'MASTER';
        else if (score >= 50000) this.player.rank = 'DIAMOND';
        else if (score >= 25000) this.player.rank = 'PLATINUM';
        else if (score >= 10000) this.player.rank = 'GOLD';
        else if (score >= 5000) this.player.rank = 'SILVER';
        else this.player.rank = 'BRONZE';
    }

    addScore(points) {
        this.player.score += points;
        this.updateRank();
        this.updateUI();
    }

    // Achievement System
    unlockAchievement(achievementId) {
        const achievement = this.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.unlocked) {
            achievement.unlocked = true;
            this.addXP(200, `- ${achievement.name}!`);
            this.showAchievementNotification(achievement);
            this.playSound('achievement');
            return true;
        }
        return false;
    }

    checkAchievements() {
        // First run achievement
        if (this.player.totalRuns === 1) {
            this.unlockAchievement('first_run');
        }

        // Combo master achievement
        if (this.player.streak >= 5) {
            this.unlockAchievement('combo_master');
        }

        // Marathon achievement (1 hour session)
        const sessionTime = (Date.now() - this.sessionStartTime) / 1000;
        if (sessionTime >= 3600) {
            this.unlockAchievement('marathon');
        }

        // Night owl achievement
        const hour = new Date().getHours();
        if (hour >= 0 && hour < 6) {
            this.unlockAchievement('night_owl');
        }

        // Line master achievement
        if (this.player.codeLines >= 1000) {
            this.unlockAchievement('line_master');
        }

        // Speed demon achievement
        if (this.lastRunTime > 0 && this.lastRunTime < 60) {
            this.unlockAchievement('speed_demon');
        }

        // Perfectionist achievement
        const successRate = this.player.totalRuns > 0 ? (this.player.successfulRuns / this.player.totalRuns) : 0;
        if (this.player.totalRuns >= 10 && successRate === 1.0) {
            this.unlockAchievement('perfectionist');
        }
    }

    // UI Updates
    updateUI() {
        document.getElementById('player-level').textContent = this.player.level;
        document.getElementById('player-score').textContent = this.player.score.toLocaleString();
        document.getElementById('player-rank').textContent = this.player.rank;
        document.getElementById('current-xp').textContent = this.player.xp % 1000;
        document.getElementById('next-level-xp').textContent = '1000';
        
        const xpProgress = (this.player.xp % 1000) / 1000 * 100;
        document.getElementById('xp-fill').style.width = `${xpProgress}%`;
        
        // Update recent achievement display
        const unlockedAchievements = this.achievements.filter(a => a.unlocked);
        const recentAchievement = document.getElementById('recent-achievement');
        if (unlockedAchievements.length > 0) {
            const latest = unlockedAchievements[unlockedAchievements.length - 1];
            recentAchievement.textContent = `${latest.icon} ${latest.name}`;
        }
    }

    // Notifications and Modals
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 0.5rem;">${this.getNotificationTitle(type)}</div>
            <div>${message}</div>
        `;
        
        document.getElementById('notification-container').appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'notificationSlide 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'notification achievement';
        notification.innerHTML = `
            <div style="font-weight: 700; margin-bottom: 0.5rem;">🏆 ACHIEVEMENT UNLOCKED!</div>
            <div>${achievement.icon} ${achievement.name}</div>
            <div style="font-size: 0.8rem; opacity: 0.8; margin-top: 0.25rem;">${achievement.desc}</div>
        `;
        
        document.getElementById('notification-container').appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'notificationSlide 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    showLevelUp(newLevel) {
        const modal = document.getElementById('levelup-modal');
        document.getElementById('new-level').textContent = newLevel;
        modal.classList.remove('hidden');
        this.playSound('levelup');
        
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 3000);
    }

    getNotificationTitle(type) {
        switch(type) {
            case 'success': return '✅ SUCCESS';
            case 'error': return '❌ ERROR';
            case 'achievement': return '🏆 ACHIEVEMENT';
            default: return 'ℹ️ INFO';
        }
    }

    // Sound Effects (simulated)
    playSound(type) {
        console.log(`🔊 Playing sound: ${type}`);
        // In a real implementation, you would play actual sound files here
    }
}

// Code Templates with Cyberpunk Styling
const templates = {
    nodejs: `const fs = require('fs');
const readline = require('readline');

// ⚡ COMPETITIVE PROGRAMMING TURBO TEMPLATE ⚡
// Optimized for speed and efficiency

let input = '';
let lines = [];
let lineIndex = 0;

// 🚀 Fast I/O Setup
process.stdin.on('data', data => input += data);
process.stdin.on('end', () => {
    lines = input.trim().split('\\n');
    solve();
});

// 📚 Utility Functions
function readLine() { return lines[lineIndex++]; }
function readInt() { return parseInt(readLine()); }
function readInts() { return readLine().split(' ').map(Number); }
function readFloat() { return parseFloat(readLine()); }
function readFloats() { return readLine().split(' ').map(Number); }

// 🎯 Main Solution Function
function solve() {
    // 🔥 YOUR CODE STARTS HERE 🔥
    const t = readInt(); // Test cases
    
    for (let i = 0; i < t; i++) {
        const n = readInt();
        
        // TODO: Implement your solution
        console.log(n * 2); // Example output
    }
    
    // 🏆 READY TO DOMINATE THE LEADERBOARD! 🏆
}`,

    javascript: `// 🎮 RETRO CP ARENA - JAVASCRIPT EDITION 🎮
// Browser-optimized competitive programming template

function solve() {
    // 💾 Input Processing
    const inputElement = document.getElementById('input');
    const input = inputElement ? inputElement.value.trim() : '';
    const lines = input.split('\\n');
    let lineIndex = 0;
    
    // 🛠️ Helper Functions
    function readLine() { return lines[lineIndex++] || ''; }
    function readInt() { return parseInt(readLine()) || 0; }
    function readInts() { return readLine().split(' ').map(Number); }
    function readFloat() { return parseFloat(readLine()) || 0; }
    
    // 🎯 Solution Logic
    const t = readInt(); // Number of test cases
    let output = '';
    
    for (let i = 0; i < t; i++) {
        const n = readInt();
        
        // TODO: Write your algorithm here
        const result = n * 2; // Example calculation
        output += result + '\\n';
    }
    
    return output.trim();
}

// 🚀 Execute and Display Results
const result = solve();
console.log(result);

// 🏆 LEVEL UP YOUR CODING SKILLS! 🏆`
};

// Main Application Class
class CPArenaApp {
    constructor() {
        this.gameState = new GameState();
        this.codeState = {
            nodejs: templates.nodejs,
            javascript: templates.javascript
        };
        
        // DOM Elements
        this.elements = {};
        this.isInitialized = false;
    }

    // Initialize Application
    async init() {
        if (this.isInitialized) return;
        
        await this.waitForDOM();
        this.initializeElements();
        this.setupEventListeners();
        this.setupCodeEditor();
        this.setupTimer();
        this.startSessionTimer();
        this.loadInitialCode();
        this.gameState.updateUI();
        
        this.isInitialized = true;
        console.log('🎮 CP ARENA INITIALIZED - WELCOME TO THE BATTLEFIELD! 🎮');
    }

    waitForDOM() {
        return new Promise(resolve => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    initializeElements() {
        this.elements = {
            codeEditor: document.getElementById('code-editor'),
            codeHighlight: document.getElementById('code-highlight'),
            lineNumbers: document.getElementById('line-numbers'),
            inputArea: document.getElementById('input'),
            outputArea: document.getElementById('output'),
            timerDisplay: document.getElementById('timer-display'),
            performanceStats: document.getElementById('performance-stats'),
            envSwitches: document.querySelectorAll('.env-switch'),
            challengeBtns: document.querySelectorAll('.challenge-btn'),
            achievementModal: document.getElementById('achievement-modal'),
            achievementsGrid: document.getElementById('achievements-grid'),
            leaderboardTicker: document.getElementById('leaderboard-ticker')
        };
    }

    setupEventListeners() {
        // Environment switches
        this.elements.envSwitches.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchEnvironment(e.target.dataset.env);
            });
        });

        // Challenge mode buttons
        this.elements.challengeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectChallenge(e.target.dataset.challenge);
            });
        });

        // Code editor events
        if (this.elements.codeEditor) {
            this.elements.codeEditor.addEventListener('input', () => {
                this.updateSyntaxHighlighting();
                this.updateLineNumbers();
                this.saveCodeState();
                this.countCodeLines();
            });

            this.elements.codeEditor.addEventListener('scroll', () => {
                this.syncScroll();
            });

            this.elements.codeEditor.addEventListener('keydown', (e) => {
                this.handleCodeEditorKeys(e);
            });
        }

        // Global keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    setupCodeEditor() {
        if (!this.elements.codeEditor) return;
        
        // Initial setup
        this.updateSyntaxHighlighting();
        this.updateLineNumbers();
        
        // Set up syntax highlighting
        if (typeof hljs !== 'undefined') {
            hljs.highlightAll();
        }
    }

    setupTimer() {
        setInterval(() => {
            if (this.gameState.timer.running) {
                this.gameState.timer.elapsed = Date.now() - this.gameState.timer.startTime;
                this.updateTimerDisplay();
            }
        }, 100);
    }

    startSessionTimer() {
        setInterval(() => {
            this.gameState.player.sessionTime = (Date.now() - this.gameState.sessionStartTime) / 1000;
            this.gameState.checkAchievements();
        }, 60000); // Check every minute
    }

    // Environment Management
    switchEnvironment(env) {
        if (env === this.gameState.currentEnvironment) return;
        
        // Save current code
        this.saveCodeState();
        
        // Update environment
        this.gameState.currentEnvironment = env;
        
        // Update UI
        this.elements.envSwitches.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.env === env);
        });
        
        // Load code for new environment
        this.loadCodeForEnvironment(env);
        
        // Update syntax highlighting
        setTimeout(() => {
            this.updateSyntaxHighlighting();
            this.updateLineNumbers();
        }, 50);
        
        this.gameState.showNotification(`Switched to ${env.toUpperCase()}`, 'info');
    }

    loadCodeForEnvironment(env) {
        if (this.elements.codeEditor && this.codeState[env]) {
            this.elements.codeEditor.value = this.codeState[env];
        }
    }

    saveCodeState() {
        if (this.elements.codeEditor && this.gameState.currentEnvironment) {
            this.codeState[this.gameState.currentEnvironment] = this.elements.codeEditor.value;
        }
    }

    loadInitialCode() {
        this.loadCodeForEnvironment(this.gameState.currentEnvironment);
    }

    // Code Editor Features
    updateSyntaxHighlighting() {
        if (!this.elements.codeEditor || !this.elements.codeHighlight) return;
        
        try {
            const code = this.elements.codeEditor.value;
            let highlightedCode = code;
            
            if (typeof hljs !== 'undefined') {
                highlightedCode = hljs.highlight(code, { language: 'javascript' }).value;
            }
            
            const codeElement = this.elements.codeHighlight.querySelector('code');
            if (codeElement) {
                codeElement.innerHTML = highlightedCode;
            }
        } catch (error) {
            console.error('Syntax highlighting error:', error);
        }
    }

    updateLineNumbers() {
        if (!this.elements.codeEditor || !this.elements.lineNumbers) return;
        
        const lines = this.elements.codeEditor.value.split('\n').length;
        let lineNumbersContent = '';
        
        for (let i = 1; i <= Math.max(lines, 20); i++) {
            lineNumbersContent += i + '\n';
        }
        
        this.elements.lineNumbers.textContent = lineNumbersContent;
    }

    syncScroll() {
        if (!this.elements.codeEditor) return;
        
        const scrollTop = this.elements.codeEditor.scrollTop;
        const scrollLeft = this.elements.codeEditor.scrollLeft;
        
        if (this.elements.codeHighlight) {
            this.elements.codeHighlight.scrollTop = scrollTop;
            this.elements.codeHighlight.scrollLeft = scrollLeft;
        }
        
        if (this.elements.lineNumbers) {
            this.elements.lineNumbers.scrollTop = scrollTop;
        }
    }

    handleCodeEditorKeys(e) {
        if (e.key === 'Tab') {
            e.preventDefault();
            this.insertTab();
        }
    }

    insertTab() {
        const editor = this.elements.codeEditor;
        if (!editor) return;
        
        const start = editor.selectionStart;
        const end = editor.selectionEnd;
        
        editor.value = editor.value.substring(0, start) + '    ' + editor.value.substring(end);
        editor.selectionStart = editor.selectionEnd = start + 4;
        
        this.updateSyntaxHighlighting();
        this.updateLineNumbers();
    }

    countCodeLines() {
        if (this.elements.codeEditor) {
            const lines = this.elements.codeEditor.value.split('\n').length;
            this.gameState.player.codeLines += Math.max(0, lines - this.gameState.player.codeLines);
        }
    }

    // Code Execution
    async runCode() {
        if (!this.elements.outputArea) return;
        
        this.gameState.timer.startTime = Date.now();
        this.gameState.timer.running = true;
        
        // Show loading state
        this.setLoadingState(true);
        this.elements.outputArea.value = 'EXECUTING CODE...';
        
        // Simulate execution delay for arcade feel
        await new Promise(resolve => setTimeout(resolve, 500));
        
        try {
            const startTime = Date.now();
            let result = '';
            
            if (this.gameState.currentEnvironment === 'javascript') {
                result = this.executeJavaScript();
            } else {
                result = this.getNodeJsMessage();
            }
            
            const executionTime = Date.now() - startTime;
            this.lastRunTime = executionTime / 1000;
            
            // Update game state
            this.gameState.player.totalRuns++;
            if (!result.includes('Error')) {
                this.gameState.player.successfulRuns++;
                this.gameState.player.streak++;
                this.gameState.addXP(50, '- Code Execution');
                this.gameState.addScore(Math.max(100 - executionTime, 10));
            } else {
                this.gameState.player.streak = 0;
            }
            
            // Display results
            this.elements.outputArea.value = result;
            this.updatePerformanceStats(executionTime);
            
            // Check achievements
            this.gameState.lastRunTime = this.lastRunTime;
            this.gameState.checkAchievements();
            
            this.gameState.playSound('success');
            
        } catch (error) {
            this.elements.outputArea.value = `EXECUTION ERROR:\n${error.message}`;
            this.gameState.player.streak = 0;
            this.gameState.playSound('error');
        }
        
        this.gameState.timer.running = false;
        this.setLoadingState(false);
    }

    executeJavaScript() {
        if (!this.elements.codeEditor) return 'Code editor not available';
        
        try {
            const code = this.elements.codeEditor.value;
            let capturedOutput = '';
            
            // Create execution context
            const wrappedCode = `
                (function() {
                    const console = {
                        log: function(...args) {
                            window.capturedOutput += args.map(arg => 
                                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                            ).join(' ') + '\\n';
                        }
                    };
                    
                    window.capturedOutput = '';
                    
                    ${code}
                    
                    return window.capturedOutput;
                })();
            `;
            
            const result = eval(wrappedCode);
            return result || 'Code executed successfully (no output)';
            
        } catch (error) {
            return `Runtime Error: ${error.message}\n\nStack Trace:\n${error.stack || 'No stack trace available'}`;
        }
    }

    getNodeJsMessage() {
        if (!this.elements.inputArea) return 'Input area not available';
        
        return `Node.js Environment (Cannot execute in browser)

This template is designed for competitive programming platforms.

To use this code:
1. Copy the code to your local environment
2. Save as solution.js
3. Run: node solution.js < input.txt

Current input:
${this.elements.inputArea.value}

Expected behavior:
- Reads input from stdin
- Processes test cases
- Outputs results to stdout

Switch to JavaScript tab for browser-compatible code execution.`;
    }

    updatePerformanceStats(executionTime) {
        if (this.elements.performanceStats) {
            const runScore = Math.max(100 - executionTime, 10);
            document.getElementById('exec-time').textContent = `${executionTime}ms`;
            document.getElementById('run-score').textContent = runScore;
        }
    }

    setLoadingState(loading) {
        const executeButtons = document.querySelectorAll('.execute-btn');
        executeButtons.forEach(btn => {
            if (loading) {
                btn.classList.add('loading');
                btn.disabled = true;
            } else {
                btn.classList.remove('loading');
                btn.disabled = false;
            }
        });
    }

    // Timer Functions
    startTimer() {
        this.gameState.timer.startTime = Date.now();
        this.gameState.timer.running = true;
        this.gameState.showNotification('Timer started!', 'info');
    }

    stopTimer() {
        this.gameState.timer.running = false;
        this.gameState.showNotification('Timer stopped!', 'info');
    }

    resetTimer() {
        this.gameState.timer = { running: false, startTime: 0, elapsed: 0 };
        this.updateTimerDisplay();
        this.gameState.showNotification('Timer reset!', 'info');
    }

    updateTimerDisplay() {
        if (!this.elements.timerDisplay) return;
        
        const elapsed = this.gameState.timer.elapsed;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        this.elements.timerDisplay.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Challenge System
    selectChallenge(challenge) {
        this.elements.challengeBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.challenge === challenge);
        });
        
        this.gameState.showNotification(`Selected ${challenge.toUpperCase()} mode!`, 'info');
        
        // Apply challenge bonuses
        switch(challenge) {
            case 'daily':
                this.gameState.showNotification('2x XP bonus active!', 'success');
                break;
            case 'speed':
                this.startTimer();
                break;
            case 'tournament':
                this.gameState.showNotification('Tournament mode activated!', 'info');
                break;
            case 'survival':
                this.gameState.showNotification('Survival mode - increasing difficulty!', 'warning');
                break;
        }
    }

    // Achievement System
    showAchievements() {
        if (!this.elements.achievementModal || !this.elements.achievementsGrid) return;
        
        // Clear existing achievements
        this.elements.achievementsGrid.innerHTML = '';
        
        // Populate achievements
        this.gameState.achievements.forEach(achievement => {
            const achievementElement = document.createElement('div');
            achievementElement.className = `achievement-item ${achievement.unlocked ? 'unlocked' : ''}`;
            achievementElement.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.desc}</div>
            `;
            this.elements.achievementsGrid.appendChild(achievementElement);
        });
        
        this.elements.achievementModal.classList.remove('hidden');
    }

    closeAchievements() {
        if (this.elements.achievementModal) {
            this.elements.achievementModal.classList.add('hidden');
        }
    }

    // Download Functions
    downloadCode() {
        if (!this.elements.codeEditor) return;
        
        const code = this.elements.codeEditor.value;
        const filename = this.gameState.currentEnvironment === 'nodejs' ? 'solution-nodejs.js' : 'solution.js';
        this.downloadFile(code, filename, 'text/javascript');
        this.gameState.showNotification('Code downloaded!', 'success');
    }

    downloadInput() {
        if (!this.elements.inputArea) return;
        
        this.downloadFile(this.elements.inputArea.value, 'input.txt', 'text/plain');
        this.gameState.showNotification('Input downloaded!', 'success');
    }

    downloadOutput() {
        if (!this.elements.outputArea) return;
        
        this.downloadFile(this.elements.outputArea.value, 'output.txt', 'text/plain');
        this.gameState.showNotification('Output downloaded!', 'success');
    }

    downloadFile(content, filename, contentType) {
        try {
            const blob = new Blob([content], { type: contentType });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            this.gameState.showNotification('Download failed!', 'error');
        }
    }

    // Reset Functions
    resetCode() {
        if (!this.elements.codeEditor) return;
        
        const template = templates[this.gameState.currentEnvironment];
        this.elements.codeEditor.value = template;
        this.codeState[this.gameState.currentEnvironment] = template;
        
        setTimeout(() => {
            this.updateSyntaxHighlighting();
            this.updateLineNumbers();
        }, 50);
        
        this.gameState.showNotification('Code reset to template!', 'info');
    }

    resetInput() {
        if (!this.elements.inputArea) return;
        
        this.elements.inputArea.value = `3
5
10
15`;
        this.gameState.showNotification('Input reset!', 'info');
    }

    resetOutput() {
        if (!this.elements.outputArea) return;
        
        this.elements.outputArea.value = '';
        this.gameState.showNotification('Output cleared!', 'info');
    }

    // Keyboard Shortcuts
    handleKeyboardShortcuts(e) {
        if ((e.ctrlKey || e.metaKey)) {
            switch(e.key) {
                case 'r':
                    e.preventDefault();
                    this.runCode();
                    break;
                case 'd':
                    e.preventDefault();
                    this.downloadCode();
                    break;
                case '1':
                    e.preventDefault();
                    this.switchEnvironment('nodejs');
                    break;
                case '2':
                    e.preventDefault();
                    this.switchEnvironment('javascript');
                    break;
            }
            
            if (e.shiftKey && e.key === 'R') {
                e.preventDefault();
                this.resetCode();
            }
        }
        
        if (e.key === 'Escape') {
            this.closeAchievements();
        }
    }
}

// Global Application Instance
const cpArena = new CPArenaApp();

// Global Functions for HTML onclick handlers
window.runCode = () => cpArena.runCode();
window.downloadCode = () => cpArena.downloadCode();
window.downloadInput = () => cpArena.downloadInput();
window.downloadOutput = () => cpArena.downloadOutput();
window.resetCode = () => cpArena.resetCode();
window.resetInput = () => cpArena.resetInput();
window.resetOutput = () => cpArena.resetOutput();
window.startTimer = () => cpArena.startTimer();
window.stopTimer = () => cpArena.stopTimer();
window.resetTimer = () => cpArena.resetTimer();
window.showAchievements = () => cpArena.showAchievements();
window.closeAchievements = () => cpArena.closeAchievements();

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    cpArena.init().then(() => {
        console.log('🚀 CP ARENA READY - LET THE CODING BEGIN! 🚀');
    }).catch(error => {
        console.error('❌ Failed to initialize CP Arena:', error);
    });
});

// Auto-save functionality
setInterval(() => {
    if (cpArena.isInitialized) {
        cpArena.saveCodeState();
    }
}, 5000);

// Welcome message
console.log(`
██████╗ ██████╗      █████╗ ██████╗ ███████╗███╗   ██╗ █████╗ 
██╔══██╗██╔══██╗    ██╔══██╗██╔══██╗██╔════╝████╗  ██║██╔══██╗
██║  ██║██████╔╝    ███████║██████╔╝█████╗  ██╔██╗ ██║███████║
██║  ██║██╔═══╝     ██╔══██║██╔══██╗██╔══╝  ██║╚██╗██║██╔══██║
██████╔╝██║         ██║  ██║██║  ██║███████╗██║ ╚████║██║  ██║
╚═════╝ ╚═╝         ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝

🎮 RETRO CYBERPUNK COMPETITIVE PROGRAMMING ARENA 🎮
`);