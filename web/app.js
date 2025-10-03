// Import FlowScript modules (assuming they're accessible)
// Note: In a real deployment, you'd need to bundle these or use a module system

class FlowScriptIDE {
    constructor() {
        this.editor = document.getElementById('codeEditor');
        this.output = document.getElementById('output');
        this.astDisplay = document.getElementById('astDisplay');
        this.variablesDisplay = document.getElementById('variablesDisplay');
        this.tokensDisplay = document.getElementById('tokensDisplay');
        this.statusText = document.getElementById('statusText');
        this.executionTime = document.getElementById('executionTime');
        this.lineNumbers = document.getElementById('lineNumbers');
        this.lineCount = document.getElementById('lineCount');
        
        this.currentProgram = null;
        this.currentAST = null;
        this.currentTokens = null;
        
        this.initializeEventListeners();
        this.updateLineNumbers();
        this.loadExamples();
    }
    
    initializeEventListeners() {
        // Editor events
        this.editor.addEventListener('input', () => {
            this.updateLineNumbers();
            this.updateLineCount();
        });
        
        this.editor.addEventListener('scroll', () => {
            this.lineNumbers.scrollTop = this.editor.scrollTop;
        });
        
        this.editor.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                e.preventDefault();
                this.runProgram();
            }
        });
        
        // Button events
        document.getElementById('runBtn').addEventListener('click', () => this.runProgram());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearEditor());
        document.getElementById('clearOutputBtn').addEventListener('click', () => this.clearOutput());
        document.getElementById('formatBtn').addEventListener('click', () => this.formatCode());
        document.getElementById('examplesBtn').addEventListener('click', () => this.showExamples());
        
        // Tab events
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        // Modal events
        document.getElementById('closeModal').addEventListener('click', () => this.hideExamples());
        document.getElementById('examplesModal').addEventListener('click', (e) => {
            if (e.target.id === 'examplesModal') this.hideExamples();
        });
        
        // Example cards
        document.querySelectorAll('.example-card').forEach(card => {
            card.addEventListener('click', () => this.loadExample(card.dataset.example));
        });
    }
    
    updateLineNumbers() {
        const lines = this.editor.value.split('\n');
        const numbers = lines.map((_, i) => i + 1).join('\n');
        this.lineNumbers.textContent = numbers;
    }
    
    updateLineCount() {
        const lineCount = this.editor.value.split('\n').length;
        this.lineCount.textContent = `Lines: ${lineCount}`;
    }
    
    async runProgram() {
        const code = this.editor.value.trim();
        if (!code) {
            this.showError('Please enter some FlowScript code to run.');
            return;
        }
        
        this.setStatus('Running...', true);
        this.clearOutput();
        
        const startTime = performance.now();
        
        try {
            // Since we can't import modules directly in the browser,
            // we'll simulate the FlowScript execution
            await this.simulateExecution(code);
            
            const endTime = performance.now();
            const executionTime = (endTime - startTime).toFixed(2);
            
            this.setStatus('Execution completed');
            this.executionTime.textContent = `${executionTime}ms`;
            
        } catch (error) {
            this.showError(`Error: ${error.message}`);
            this.setStatus('Execution failed');
        }
    }
    
    async simulateExecution(code) {
        // This is a simulation since we can't easily import ES modules in browser
        // In a real implementation, you'd use webpack or another bundler
        
        const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        
        // Simulate parsing
        await this.sleep(100);
        this.showTokens(this.simulateTokenization(lines));
        
        // Simulate AST generation
        await this.sleep(100);
        this.showAST(this.simulateAST(lines));
        
        // Simulate execution
        await this.sleep(200);
        const result = this.simulateInterpreter(lines);
        
        this.showOutput(result.output);
        this.showVariables(result.variables);
    }
    
    simulateTokenization(lines) {
        const tokens = [];
        const tokenTypes = {
            'create': 'keyword',
            'a': 'keyword', 
            'number': 'keyword',
            'text': 'keyword',
            'boolean': 'keyword',
            'called': 'keyword',
            'with': 'keyword',
            'value': 'keyword',
            'say': 'keyword',
            'display': 'keyword',
            'if': 'keyword',
            'then': 'keyword',
            'repeat': 'keyword',
            'times': 'keyword',
            'plus': 'operator',
            'minus': 'operator',
            'times': 'operator',
            'divided': 'operator',
            'by': 'operator',
            'is': 'operator',
            'greater': 'operator',
            'than': 'operator',
            'equals': 'operator',
            ':': 'punctuation'
        };
        
        lines.forEach((line, lineNum) => {
            const words = line.trim().split(/\s+/);
            words.forEach(word => {
                let type = 'identifier';
                const cleanWord = word.replace(/[^\w]/g, '');
                
                if (tokenTypes[cleanWord.toLowerCase()]) {
                    type = tokenTypes[cleanWord.toLowerCase()];
                } else if (/^\d+(\.\d+)?$/.test(cleanWord)) {
                    type = 'number';
                } else if (word.includes('"')) {
                    type = 'string';
                } else if (/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(cleanWord)) {
                    type = 'identifier';
                }
                
                if (cleanWord) {
                    tokens.push({ type, value: word, line: lineNum + 1 });
                }
            });
        });
        
        return tokens;
    }
    
    simulateAST(lines) {
        const statements = [];
        
        lines.forEach((line, index) => {
            const trimmed = line.trim().toLowerCase();
            let nodeType = 'Unknown';
            
            if (trimmed.startsWith('create')) {
                nodeType = 'VariableDeclaration';
            } else if (trimmed.startsWith('say') || trimmed.startsWith('display')) {
                nodeType = 'Output';
            } else if (trimmed.startsWith('if')) {
                nodeType = 'Conditional';
            } else if (trimmed.startsWith('repeat')) {
                nodeType = 'Loop';
            }
            
            statements.push({
                type: nodeType,
                line: index + 1,
                content: line.trim()
            });
        });
        
        return { type: 'Program', statements };
    }
    
    simulateInterpreter(lines) {
        const output = [];
        const variables = {};
        
        lines.forEach(line => {
            const trimmed = line.trim().toLowerCase();
            
            // Variable declarations
            const varMatch = trimmed.match(/create a (number|text|boolean) called (\w+) with value (.+)/);
            if (varMatch) {
                const [, type, name, value] = varMatch;
                let parsedValue = value.replace(/"/g, '');
                
                if (type === 'number') {
                    parsedValue = parseFloat(parsedValue) || 0;
                } else if (type === 'boolean') {
                    parsedValue = parsedValue === 'true';
                }
                
                variables[name] = { value: parsedValue, type };
                return;
            }
            
            // Say statements
            const sayMatch = trimmed.match(/say (.+)/);
            if (sayMatch) {
                let message = sayMatch[1].replace(/"/g, '');
                
                // Handle variable references and simple expressions
                message = message.replace(/(\w+)/g, (match) => {
                    if (variables[match]) {
                        return variables[match].value;
                    }
                    return match;
                });
                
                // Handle simple "plus" concatenation
                message = message.replace(/(.+) plus (.+)/, (match, left, right) => {
                    const leftVal = variables[left.trim()] ? variables[left.trim()].value : left.trim().replace(/"/g, '');
                    const rightVal = variables[right.trim()] ? variables[right.trim()].value : right.trim().replace(/"/g, '');
                    return leftVal + rightVal;
                });
                
                output.push(message);
                return;
            }
            
            // Display statements
            const displayMatch = trimmed.match(/display (.+)/);
            if (displayMatch) {
                const varName = displayMatch[1];
                if (variables[varName]) {
                    output.push(variables[varName].value.toString());
                } else {
                    output.push(`undefined variable: ${varName}`);
                }
                return;
            }
            
            // Simple conditionals
            const ifMatch = trimmed.match(/if (.+) then say "(.+)"/);
            if (ifMatch) {
                const [, condition, message] = ifMatch;
                // Very basic condition evaluation
                if (condition.includes('greater than')) {
                    const [left, right] = condition.split('is greater than').map(s => s.trim());
                    const leftVal = variables[left] ? variables[left].value : parseFloat(left) || 0;
                    const rightVal = parseFloat(right) || 0;
                    if (leftVal > rightVal) {
                        output.push(message);
                    }
                }
                return;
            }
            
            // Simple loops
            const loopMatch = trimmed.match(/repeat (\d+) times: say "(.+)"/);
            if (loopMatch) {
                const [, count, message] = loopMatch;
                const num = parseInt(count);
                for (let i = 0; i < num; i++) {
                    output.push(message);
                }
                return;
            }
        });
        
        return { output, variables };
    }
    
    showOutput(outputLines) {
        this.output.innerHTML = '';
        
        if (outputLines.length === 0) {
            this.output.innerHTML = '<div class="output-line">No output generated.</div>';
            return;
        }
        
        outputLines.forEach((line, index) => {
            const div = document.createElement('div');
            div.className = 'output-line success';
            div.textContent = `> ${line}`;
            this.output.appendChild(div);
        });
    }
    
    showTokens(tokens) {
        this.tokensDisplay.innerHTML = '';
        
        tokens.forEach(token => {
            const span = document.createElement('span');
            span.className = `token ${token.type}`;
            span.textContent = token.value;
            span.title = `${token.type.toUpperCase()} at line ${token.line}`;
            this.tokensDisplay.appendChild(span);
        });
    }
    
    showAST(ast) {
        this.astDisplay.innerHTML = '';
        this.renderASTNode(ast, this.astDisplay, 0);
    }
    
    renderASTNode(node, container, depth) {
        const div = document.createElement('div');
        div.className = 'ast-node';
        div.style.marginLeft = `${depth * 1}rem`;
        
        const typeSpan = document.createElement('span');
        typeSpan.className = 'ast-node-type';
        typeSpan.textContent = node.type;
        div.appendChild(typeSpan);
        
        if (node.content) {
            const contentSpan = document.createElement('span');
            contentSpan.className = 'ast-node-content';
            contentSpan.textContent = ` - ${node.content}`;
            div.appendChild(contentSpan);
        }
        
        container.appendChild(div);
        
        if (node.statements) {
            node.statements.forEach(stmt => {
                this.renderASTNode(stmt, container, depth + 1);
            });
        }
    }
    
    showVariables(variables) {
        this.variablesDisplay.innerHTML = '';
        
        if (Object.keys(variables).length === 0) {
            this.variablesDisplay.innerHTML = '<div class="output-line">No variables defined.</div>';
            return;
        }
        
        Object.entries(variables).forEach(([name, info]) => {
            const div = document.createElement('div');
            div.className = 'variable-item';
            
            div.innerHTML = `
                <div>
                    <span class="variable-name">${name}</span>
                    <span class="variable-type">${info.type}</span>
                </div>
                <span class="variable-value">${JSON.stringify(info.value)}</span>
            `;
            
            this.variablesDisplay.appendChild(div);
        });
    }
    
    showError(message) {
        this.output.innerHTML = '';
        const div = document.createElement('div');
        div.className = 'output-line error';
        div.textContent = message;
        this.output.appendChild(div);
    }
    
    setStatus(text, loading = false) {
        this.statusText.textContent = text;
        this.statusText.className = loading ? 'loading' : '';
    }
    
    clearEditor() {
        this.editor.value = '';
        this.updateLineNumbers();
        this.updateLineCount();
        this.clearOutput();
        this.setStatus('Ready');
        this.executionTime.textContent = '';
    }
    
    clearOutput() {
        this.output.innerHTML = '';
        this.astDisplay.innerHTML = '';
        this.variablesDisplay.innerHTML = '';
        this.tokensDisplay.innerHTML = '';
    }
    
    formatCode() {
        const lines = this.editor.value.split('\n');
        const formatted = lines
            .map(line => line.trim())
            .filter(line => line)
            .join('\n');
        
        this.editor.value = formatted;
        this.updateLineNumbers();
        this.updateLineCount();
    }
    
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
        
        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabName}Tab`);
        });
    }
    
    showExamples() {
        document.getElementById('examplesModal').classList.add('active');
    }
    
    hideExamples() {
        document.getElementById('examplesModal').classList.remove('active');
    }
    
    loadExample(exampleName) {
        const examples = this.getExamples();
        if (examples[exampleName]) {
            this.editor.value = examples[exampleName].code;
            this.updateLineNumbers();
            this.updateLineCount();
            this.hideExamples();
            this.setStatus(`Loaded example: ${examples[exampleName].title}`);
        }
    }
    
    loadExamples() {
        const examples = this.getExamples();
        const cards = document.querySelectorAll('.example-card');
        
        cards.forEach(card => {
            const example = examples[card.dataset.example];
            if (example) {
                card.querySelector('h4').textContent = example.title;
                card.querySelector('p').textContent = example.description;
            }
        });
    }
    
    getExamples() {
        return {
            'hello-world': {
                title: 'Hello World',
                description: 'Basic output and variables',
                code: `# FlowScript Hello World Example
Create a text called greeting with value "Hello"
Create a text called name with value "World"
Say greeting plus " " plus name
Say "Welcome to FlowScript!"`
            },
            'math': {
                title: 'Math Operations',
                description: 'Arithmetic and calculations',
                code: `# FlowScript Math Example
Create a number called x with value 10
Create a number called y with value 5

Say "Math with " plus x plus " and " plus y
Say "Addition: " plus x plus y
Say "Subtraction: " plus x minus y
Say "Multiplication: " plus x times y
Say "Division: " plus x divided by y`
            },
            'conditionals': {
                title: 'Conditionals',
                description: 'If-then logic',
                code: `# FlowScript Conditionals Example
Create a number called age with value 20
Create a number called score with value 85

If age is greater than 18 then say "You can vote"
If score is greater than 80 then say "Great score!"

Create a text called status with value "active"
If status equals "active" then say "System is running"`
            },
            'loops': {
                title: 'Loops',
                description: 'Repetition and iteration',
                code: `# FlowScript Loops Example
Say "Countdown:"
Repeat 5 times: say "Tick"

Say "Welcome messages:"
Repeat 3 times: say "Welcome to FlowScript!"`
            },
            'functions': {
                title: 'Functions',
                description: 'Reusable code blocks',
                code: `# FlowScript Functions Example
Define a function called greet that takes name and says "Hello " plus name

Create a text called user1 with value "Alice"
Create a text called user2 with value "Bob"

greet user1
greet user2`
            },
            'complex': {
                title: 'Complete Program',
                description: 'Advanced features combined',
                code: `# FlowScript Complete Program Example
Create a text called appName with value "FlowScript Calculator"
Create a number called version with value 1

Say appName plus " v" plus version
Say "Starting calculations..."

Create a number called a with value 15
Create a number called b with value 7

Say "Working with numbers: " plus a plus " and " plus b

If a is greater than b then say a plus " is greater than " plus b
If b is less than a then say b plus " is less than " plus a

Create a number called sum with value a plus b
Create a number called product with value a times b

Say "Sum: " plus sum
Say "Product: " plus product

Say "Repeating final message:"
Repeat 2 times: say "Calculation complete!"

Say "Thank you for using " plus appName`
            }
        };
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize the IDE when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new FlowScriptIDE();
});