// Advanced FlowScript Interpreter with Proper Indentation
class AdvancedFlowScriptInterpreter {
    constructor() {
        this.variables = {};
        this.functions = {};
        this.output = [];
        this.translator = new UniversalSyntaxTranslator();
        this.flowchartGenerator = new FlowchartGenerator();
        this.callStack = [];
        this.maxCallStack = 100;
    }
    
    interpret(code) {
        this.variables = {};
        this.functions = {};
        this.output = [];
        this.callStack = [];
        
        const statements = this.parseToStatements(code);
        
        try {
            for (const statement of statements) {
                this.executeStatement(statement);
            }
        } catch (error) {
            if (error.type !== 'return') {
                this.output.push(`Error: ${error.message}`);
            }
        }
        
        return {
            output: this.output,
            variables: this.variables,
            functions: this.functions,
            statements: statements
        };
    }
    
    parseToStatements(code) {
        const lines = this.preprocessCode(code);
        const statements = [];
        let i = 0;
        
        while (i < lines.length) {
            const result = this.parseStatement(lines, i);
            if (result.statement) {
                statements.push(result.statement);
            }
            i = result.nextIndex;
        }
        
        return statements;
    }
    
    preprocessCode(code) {
        return code.split('\n')
            .map((line, index) => ({
                text: line.trim(),
                number: index + 1,
                indent: this.getIndentLevel(line)
            }))
            .filter(line => line.text && !line.text.startsWith('#'));
    }
    
    getIndentLevel(line) {
        let indent = 0;
        for (const char of line) {
            if (char === ' ') indent++;
            else if (char === '\t') indent += 4;
            else break;
        }
        return indent;
    }
    
    parseStatement(lines, startIndex) {
        const line = lines[startIndex];
        const text = line.text.toLowerCase();
        
        if (text.match(/create a (number|text|boolean|list) called/)) {
            return this.parseVariableDeclaration(line, startIndex);
        }
        
        if (text.startsWith('define function')) {
            return this.parseFunctionDefinition(lines, startIndex);
        }
        
        if (text.startsWith('if ')) {
            return this.parseIfStatement(lines, startIndex);
        }
        
        if (text.startsWith('while ')) {
            return this.parseWhileLoop(lines, startIndex);
        }
        
        if (text.startsWith('say ') || text.startsWith('print ')) {
            return this.parseOutputStatement(line, startIndex);
        }
        
        if (text.startsWith('return ')) {
            return this.parseReturnStatement(line, startIndex);
        }
        
        if (text.includes(' = ') || text.includes(' to ') || text.startsWith('increase ')) {
            return this.parseAssignmentStatement(line, startIndex);
        }
        
        if (text.includes('(') && text.includes(')')) {
            return this.parseFunctionCall(line, startIndex);
        }
        
        return { statement: null, nextIndex: startIndex + 1 };
    }
    
    parseVariableDeclaration(line, index) {
        const match = line.text.match(/create a (number|text|boolean|list) called (\w+) with values? (.+)/i);
        
        if (match) {
            const [, type, name, valueStr] = match;
            return {
                statement: {
                    type: 'VariableDeclaration',
                    dataType: type.toLowerCase(),
                    identifier: name,
                    value: this.parseValue(valueStr, type.toLowerCase()),
                    line: line.number,
                    original: line.text
                },
                nextIndex: index + 1
            };
        }
        
        return { statement: null, nextIndex: index + 1 };
    }
    
    parseFunctionDefinition(lines, startIndex) {
        const line = lines[startIndex];
        const match = line.text.match(/define function (\w+)(?:\s+with parameters? (.+?))?:/i);
        
        if (match) {
            const [, name, paramsStr] = match;
            const parameters = paramsStr ? 
                paramsStr.split(',').map(p => p.trim()) : [];
            
            const body = [];
            let i = startIndex + 1;
            const baseIndent = line.indent;
            
            while (i < lines.length && lines[i].indent > baseIndent) {
                const result = this.parseStatement(lines, i);
                if (result.statement) {
                    body.push(result.statement);
                }
                i = result.nextIndex;
            }
            
            return {
                statement: {
                    type: 'FunctionDefinition',
                    name: name,
                    parameters: parameters,
                    body: body,
                    line: line.number,
                    original: line.text
                },
                nextIndex: i
            };
        }
        
        return { statement: null, nextIndex: startIndex + 1 };
    }
    
    parseIfStatement(lines, startIndex) {
        const line = lines[startIndex];
        const match = line.text.match(/if (.+?)(?:\s+then\s+(.+))?:/i);
        
        if (match) {
            const condition = this.parseExpression(match[1]);
            const thenBody = [];
            let elseBody = [];
            
            // Handle inline then statement
            if (match[2]) {
                if (match[2].toLowerCase().startsWith('return ')) {
                    const returnValue = match[2].substring(7).trim();
                    thenBody.push({
                        type: 'ReturnStatement',
                        expression: this.parseExpression(returnValue),
                        line: line.number,
                        original: match[2]
                    });
                }
                return {
                    statement: {
                        type: 'ConditionalStatement',
                        condition: condition,
                        thenBody: thenBody,
                        elseBody: null,
                        line: line.number,
                        original: line.text
                    },
                    nextIndex: startIndex + 1
                };
            }
            
            let i = startIndex + 1;
            const baseIndent = line.indent;
            
            while (i < lines.length && lines[i].indent > baseIndent && 
                   !lines[i].text.toLowerCase().startsWith('else')) {
                const result = this.parseStatement(lines, i);
                if (result.statement) {
                    thenBody.push(result.statement);
                }
                i = result.nextIndex;
            }
            
            if (i < lines.length && lines[i].text.toLowerCase().startsWith('else')) {
                i++;
                while (i < lines.length && lines[i].indent > baseIndent) {
                    const result = this.parseStatement(lines, i);
                    if (result.statement) {
                        elseBody.push(result.statement);
                    }
                    i = result.nextIndex;
                }
            }
            
            return {
                statement: {
                    type: 'ConditionalStatement',
                    condition: condition,
                    thenBody: thenBody,
                    elseBody: elseBody.length > 0 ? elseBody : null,
                    line: line.number,
                    original: line.text
                },
                nextIndex: i
            };
        }
        
        return { statement: null, nextIndex: startIndex + 1 };
    }
    
    parseWhileLoop(lines, startIndex) {
        const line = lines[startIndex];
        const match = line.text.match(/while (.+?):/i);
        
        if (match) {
            const condition = this.parseExpression(match[1]);
            const body = [];
            
            let i = startIndex + 1;
            const baseIndent = line.indent;
            
            while (i < lines.length && lines[i].indent > baseIndent) {
                const result = this.parseStatement(lines, i);
                if (result.statement) {
                    body.push(result.statement);
                }
                i = result.nextIndex;
            }
            
            return {
                statement: {
                    type: 'WhileLoop',
                    condition: condition,
                    body: body,
                    line: line.number,
                    original: line.text
                },
                nextIndex: i
            };
        }
        
        return { statement: null, nextIndex: startIndex + 1 };
    }
    
    parseValue(valueStr, type) {
        valueStr = valueStr.trim();
        
        if (valueStr.startsWith('[') && valueStr.endsWith(']')) {
            const items = valueStr.slice(1, -1)
                .split(',')
                .map(item => this.parseValue(item.trim(), 'auto'));
            return { type: 'Literal', value: items };
        }
        
        if (valueStr.startsWith('"') && valueStr.endsWith('"')) {
            return { type: 'Literal', value: valueStr.slice(1, -1) };
        }
        
        if (/^-?\d+(\.\d+)?$/.test(valueStr)) {
            return { type: 'Literal', value: parseFloat(valueStr) };
        }
        
        if (valueStr === 'true' || valueStr === 'false') {
            return { type: 'Literal', value: valueStr === 'true' };
        }
        
        return this.parseExpression(valueStr);
    }
    
    parseExpression(expr) {
        expr = expr.trim();
        
        const operators = [
            { regex: / and /i, op: 'and' },
            { regex: / or /i, op: 'or' },
            { regex: / equals /i, op: 'equals' },
            { regex: / is greater than /i, op: 'is greater than' },
            { regex: / is less than /i, op: 'is less than' },
            { regex: / >= /i, op: '>=' },
            { regex: / <= /i, op: '<=' },
            { regex: / != /i, op: '!=' },
            { regex: / plus /i, op: 'plus' },
            { regex: / minus /i, op: 'minus' },
            { regex: / times /i, op: 'times' },
            { regex: / divided by /i, op: 'divided by' }
        ];
        
        for (const { regex, op } of operators) {
            if (regex.test(expr)) {
                const parts = expr.split(regex);
                if (parts.length === 2) {
                    return {
                        type: 'BinaryExpression',
                        left: this.parseExpression(parts[0]),
                        operator: op,
                        right: this.parseExpression(parts[1])
                    };
                }
            }
        }
        
        if (expr.includes('(') && expr.includes(')')) {
            const match = expr.match(/(\w+)\((.+?)\)/);
            if (match) {
                const [, funcName, argsStr] = match;
                const args = argsStr ? 
                    argsStr.split(',').map(arg => this.parseExpression(arg.trim())) : [];
                
                return {
                    type: 'FunctionCall',
                    name: funcName,
                    arguments: args
                };
            }
        }
        
        if (expr.includes('[') && expr.includes(']')) {
            const match = expr.match(/(\w+)\[(.+?)\]/);
            if (match) {
                const [, arrayName, indexExpr] = match;
                return {
                    type: 'ArrayAccess',
                    array: { type: 'Identifier', name: arrayName },
                    index: this.parseExpression(indexExpr)
                };
            }
        }
        
        if (expr.startsWith('"') && expr.endsWith('"')) {
            return { type: 'Literal', value: expr.slice(1, -1) };
        }
        
        if (/^-?\d+(\.\d+)?$/.test(expr)) {
            return { type: 'Literal', value: parseFloat(expr) };
        }
        
        if (expr === 'true' || expr === 'false') {
            return { type: 'Literal', value: expr === 'true' };
        }
        
        if (/^[a-zA-Z_]\w*$/.test(expr)) {
            return { type: 'Identifier', name: expr };
        }
        
        return { type: 'Literal', value: expr };
    }
    
    parseOutputStatement(line, index) {
        const match = line.text.match(/(?:say|print) (.+)/i);
        if (match) {
            return {
                statement: {
                    type: 'OutputStatement',
                    expression: this.parseExpression(match[1]),
                    line: line.number,
                    original: line.text
                },
                nextIndex: index + 1
            };
        }
        return { statement: null, nextIndex: index + 1 };
    }
    
    parseReturnStatement(line, index) {
        const match = line.text.match(/return (.+)/i);
        if (match) {
            return {
                statement: {
                    type: 'ReturnStatement',
                    expression: this.parseExpression(match[1]),
                    line: line.number,
                    original: line.text
                },
                nextIndex: index + 1
            };
        }
        return { statement: null, nextIndex: index + 1 };
    }
    
    parseAssignmentStatement(line, index) {
        let match = line.text.match(/(\w+) = (.+)/);
        if (!match) {
            match = line.text.match(/set (\w+) to (.+)/i);
        }
        if (!match) {
            match = line.text.match(/increase (\w+) by (.+)/i);
            if (match) {
                return {
                    statement: {
                        type: 'AssignmentStatement',
                        identifier: match[1],
                        value: {
                            type: 'BinaryExpression',
                            left: { type: 'Identifier', name: match[1] },
                            operator: 'plus',
                            right: this.parseExpression(match[2])
                        },
                        line: line.number,
                        original: line.text
                    },
                    nextIndex: index + 1
                };
            }
        }
        
        if (match) {
            return {
                statement: {
                    type: 'AssignmentStatement',
                    identifier: match[1],
                    value: this.parseExpression(match[2]),
                    line: line.number,
                    original: line.text
                },
                nextIndex: index + 1
            };
        }
        return { statement: null, nextIndex: index + 1 };
    }
    
    parseFunctionCall(line, index) {
        const match = line.text.match(/(\w+)\((.+?)\)/);
        if (match) {
            const [, funcName, argsStr] = match;
            const args = argsStr ? 
                argsStr.split(',').map(arg => this.parseExpression(arg.trim())) : [];
            
            return {
                statement: {
                    type: 'FunctionCall',
                    name: funcName,
                    arguments: args,
                    line: line.number,
                    original: line.text
                },
                nextIndex: index + 1
            };
        }
        return { statement: null, nextIndex: index + 1 };
    }
    
    executeStatement(statement) {
        if (!statement) return;
        
        try {
            switch (statement.type) {
                case 'VariableDeclaration':
                    const value = this.evaluateExpression(statement.value);
                    this.variables[statement.identifier] = {
                        type: statement.dataType,
                        value: value
                    };
                    break;
                    
                case 'FunctionDefinition':
                    this.functions[statement.name] = statement;
                    break;
                    
                case 'OutputStatement':
                    const output = this.evaluateExpression(statement.expression);
                    this.output.push(output.toString());
                    break;
                    
                case 'AssignmentStatement':
                    const assignValue = this.evaluateExpression(statement.value);
                    if (this.variables[statement.identifier]) {
                        this.variables[statement.identifier].value = assignValue;
                    } else {
                        this.variables[statement.identifier] = {
                            type: 'auto',
                            value: assignValue
                        };
                    }
                    break;
                    
                case 'ConditionalStatement':
                    const conditionResult = this.evaluateExpression(statement.condition);
                    if (conditionResult) {
                        for (const stmt of statement.thenBody) {
                            this.executeStatement(stmt);
                        }
                    } else if (statement.elseBody) {
                        for (const stmt of statement.elseBody) {
                            this.executeStatement(stmt);
                        }
                    }
                    break;
                    
                case 'WhileLoop':
                    let iterations = 0;
                    const maxIterations = 1000;
                    while (this.evaluateExpression(statement.condition) && iterations < maxIterations) {
                        for (const stmt of statement.body) {
                            this.executeStatement(stmt);
                        }
                        iterations++;
                    }
                    if (iterations >= maxIterations) {
                        throw new Error('Loop exceeded maximum iterations');
                    }
                    break;
                    
                case 'FunctionCall':
                    this.callFunction(statement.name, statement.arguments);
                    break;
                    
                case 'ReturnStatement':
                    const returnValue = this.evaluateExpression(statement.expression);
                    throw { type: 'return', value: returnValue };
            }
        } catch (error) {
            if (error.type === 'return') {
                throw error;
            }
            throw new Error(`Runtime error in ${statement.original}: ${error.message}`);
        }
    }
    
    evaluateExpression(expr) {
        if (!expr) return null;
        
        if (expr.type === 'Literal') {
            if (Array.isArray(expr.value)) {
                return expr.value.map(item => {
                    if (typeof item === 'object' && item.type === 'Literal') {
                        return item.value;
                    }
                    return item;
                });
            }
            return expr.value;
        }
        
        if (expr.type === 'Identifier') {
            if (this.variables[expr.name]) {
                return this.variables[expr.name].value;
            }
            throw new Error(`Undefined variable: ${expr.name}`);
        }
        
        if (expr.type === 'BinaryExpression') {
            const left = this.evaluateExpression(expr.left);
            const right = this.evaluateExpression(expr.right);
            
            switch (expr.operator) {
                case 'plus':
                    if (typeof left === 'string' || typeof right === 'string') {
                        return String(left) + String(right);
                    }
                    return left + right;
                case 'minus': return left - right;
                case 'times': return left * right;
                case 'divided by': 
                    if (right === 0) throw new Error('Division by zero');
                    return left / right;
                case 'is greater than': return left > right;
                case 'is less than': return left < right;
                case '>=': return left >= right;
                case '<=': return left <= right;
                case 'equals': return left === right;
                case '!=': return left !== right;
                case 'and': return left && right;
                case 'or': return left || right;
                default: return left;
            }
        }
        
        if (expr.type === 'FunctionCall') {
            return this.callFunction(expr.name, expr.arguments);
        }
        
        if (expr.type === 'ArrayAccess') {
            const array = this.evaluateExpression(expr.array);
            const index = this.evaluateExpression(expr.index);
            if (Array.isArray(array) && index >= 0 && index < array.length) {
                return array[index];
            }
            throw new Error('Array index out of bounds');
        }
        
        return expr;
    }
    
    callFunction(name, args) {
        if (this.functions[name]) {
            if (this.callStack.length >= this.maxCallStack) {
                throw new Error('Maximum call stack size exceeded');
            }
            
            const func = this.functions[name];
            const argValues = args.map(arg => this.evaluateExpression(arg));
            
            // Save current variable state
            const savedVars = {};
            Object.keys(this.variables).forEach(key => {
                savedVars[key] = { ...this.variables[key] };
            });
            
            this.callStack.push({ function: name, variables: savedVars });
            
            // Set parameters as new variables
            for (let i = 0; i < func.parameters.length; i++) {
                this.variables[func.parameters[i]] = {
                    type: 'auto',
                    value: argValues[i] !== undefined ? argValues[i] : null
                };
            }
            
            try {
                for (const stmt of func.body) {
                    this.executeStatement(stmt);
                }
                // Restore variables
                this.variables = savedVars;
                this.callStack.pop();
                return null;
            } catch (error) {
                if (error.type === 'return') {
                    // Restore variables before returning
                    this.variables = savedVars;
                    this.callStack.pop();
                    return error.value;
                }
                // Restore variables before throwing
                this.variables = savedVars;
                this.callStack.pop();
                throw error;
            }
        }
        
        throw new Error(`Undefined function: ${name}`);
    }
    
    translateTo(language, statements = null) {
        const statementsToTranslate = statements || [];
        if (statementsToTranslate.length === 0) return 'No program to translate';
        return this.translator.translateProgram(statementsToTranslate, language);
    }
    
    generateFlowchart(statements) {
        if (!statements || statements.length === 0) return null;
        const ast = { type: 'Program', statements: statements };
        return this.flowchartGenerator.generateFlowchart(ast);
    }
    
    tokenize(code) {
        const lines = code.split('\n');
        const tokens = [];
        
        lines.forEach((line, lineNum) => {
            if (line.trim() && !line.trim().startsWith('#')) {
                const words = line.trim().split(/\s+/);
                words.forEach(word => {
                    tokens.push({
                        type: this.getTokenType(word),
                        value: word,
                        line: lineNum + 1
                    });
                });
            }
        });
        
        return tokens;
    }
    
    getTokenType(word) {
        const keywords = [
            'create', 'define', 'function', 'if', 'else', 'while', 'for', 'each', 'in',
            'return', 'say', 'print', 'set', 'to', 'increase', 'by', 'then',
            'number', 'text', 'boolean', 'list', 'called', 'with', 'value', 'values',
            'parameter', 'parameters', 'and', 'or', 'not'
        ];
        const operators = [
            'plus', 'minus', 'times', 'divided', 'by', 'is', 'greater', 'than', 'less',
            'equals', '=', '>', '<', '>=', '<=', '!=', '+', '-', '*', '/'
        ];
        
        if (keywords.includes(word.toLowerCase())) return 'keyword';
        if (operators.includes(word.toLowerCase())) return 'operator';
        if (/^\d+(\.\d+)?$/.test(word)) return 'number';
        if (word.startsWith('"') && word.endsWith('"')) return 'string';
        if (word.startsWith('[') || word.endsWith(']')) return 'punctuation';
        if (word === '(' || word === ')') return 'punctuation';
        if (/^[a-zA-Z_]\w*$/.test(word)) return 'identifier';
        return 'punctuation';
    }
}

// Flowchart Generator with Fixed Visualization
class FlowchartGenerator {
    constructor() {
        this.nodes = [];
        this.connections = [];
        this.nodeId = 0;
    }
    
    generateFlowchart(ast) {
        this.nodes = [];
        this.connections = [];
        this.nodeId = 0;
        
        const startNode = this.createNode('start', 'Start', 'start');
        let currentNode = startNode;
        
        if (ast.statements) {
            for (const statement of ast.statements) {
                const nextNode = this.processStatement(statement);
                if (nextNode) {
                    this.connect(currentNode.id, nextNode.id);
                    currentNode = nextNode;
                }
            }
        }
        
        const endNode = this.createNode('end', 'End', 'end');
        this.connect(currentNode.id, endNode.id);
        
        return {
            nodes: this.nodes,
            connections: this.connections
        };
    }
    
    processStatement(statement) {
        switch (statement.type) {
            case 'VariableDeclaration':
                return this.createNode('process', `${statement.identifier} = value`, 'process');
            case 'AssignmentStatement':
                return this.createNode('process', `${statement.identifier} = value`, 'process');
            case 'OutputStatement':
                return this.createNode('output', 'Output', 'output');
            case 'ConditionalStatement':
                return this.createNode('decision', 'Condition?', 'decision');
            case 'WhileLoop':
                return this.createNode('decision', 'While Loop?', 'decision');
            case 'FunctionDefinition':
                return this.createNode('process', `Func: ${statement.name}`, 'function');
            case 'FunctionCall':
                return this.createNode('process', `Call: ${statement.name}`, 'function');
            default:
                return this.createNode('process', 'Statement', 'process');
        }
    }
    
    createNode(id, label, type) {
        const node = {
            id: `node_${this.nodeId++}`,
            label,
            type,
            x: 0,
            y: 0
        };
        this.nodes.push(node);
        return node;
    }
    
    connect(fromId, toId, label = '') {
        this.connections.push({ from: fromId, to: toId, label });
    }
    
    generateSVG() {
        const width = 900;
        const height = 700;
        const nodeWidth = 180;
        const nodeHeight = 80;
        
        this.layoutNodes(width, height, nodeWidth, nodeHeight);
        
        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
        
        svg += `<style>
            .flowchart-start { fill: #10b981; stroke: #059669; stroke-width: 2; }
            .flowchart-end { fill: #ef4444; stroke: #dc2626; stroke-width: 2; }
            .flowchart-process { fill: #3b82f6; stroke: #2563eb; stroke-width: 2; }
            .flowchart-decision { fill: #f59e0b; stroke: #d97706; stroke-width: 2; }
            .flowchart-output { fill: #8b5cf6; stroke: #7c3aed; stroke-width: 2; }
            .flowchart-function { fill: #06b6d4; stroke: #0891b2; stroke-width: 2; }
            .flowchart-text { 
                fill: white; 
                font-family: Arial, sans-serif; 
                font-size: 13px; 
                text-anchor: middle; 
                font-weight: 600;
                pointer-events: none;
                dominant-baseline: middle;
            }
            .flowchart-connection { stroke: #374151; stroke-width: 2; fill: none; marker-end: url(#arrowhead); }
        </style>`;
        
        svg += `<defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
            </marker>
        </defs>`;
        
        for (const connection of this.connections) {
            const fromNode = this.nodes.find(n => n.id === connection.from);
            const toNode = this.nodes.find(n => n.id === connection.to);
            
            if (fromNode && toNode) {
                const startX = fromNode.x + nodeWidth / 2;
                const startY = fromNode.y + nodeHeight;
                const endX = toNode.x + nodeWidth / 2;
                const endY = toNode.y;
                
                svg += `<path d="M ${startX} ${startY} L ${endX} ${endY}" class="flowchart-connection" />`;
            }
        }
        
        for (const node of this.nodes) {
            if (node.type === 'decision') {
                const centerX = node.x + nodeWidth / 2;
                const centerY = node.y + nodeHeight / 2;
                const points = `${centerX},${node.y} ${node.x + nodeWidth},${centerY} ${centerX},${node.y + nodeHeight} ${node.x},${centerY}`;
                svg += `<polygon points="${points}" class="flowchart-${node.type}" />`;
                
                const lines = this.wrapText(node.label, 15);
                const lineHeight = 16;
                const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
                lines.forEach((line, i) => {
                    svg += `<text x="${centerX}" y="${startY + i * lineHeight}" class="flowchart-text">${this.escapeXml(line)}</text>`;
                });
            } else {
                const rx = ['start', 'end'].includes(node.type) ? 35 : 8;
                svg += `<rect x="${node.x}" y="${node.y}" width="${nodeWidth}" height="${nodeHeight}" rx="${rx}" class="flowchart-${node.type}" />`;
                
                const textX = node.x + nodeWidth / 2;
                const textY = node.y + nodeHeight / 2;
                
                const lines = this.wrapText(node.label, 18);
                const lineHeight = 18;
                const startY = textY - ((lines.length - 1) * lineHeight) / 2;
                lines.forEach((line, i) => {
                    svg += `<text x="${textX}" y="${startY + i * lineHeight}" class="flowchart-text">${this.escapeXml(line)}</text>`;
                });
            }
        }
        
        svg += '</svg>';
        return svg;
    }
    
    wrapText(text, maxLength) {
        if (text.length <= maxLength) return [text];
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            if ((currentLine + ' ' + word).trim().length <= maxLength) {
                currentLine = (currentLine + ' ' + word).trim();
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    }
    
    escapeXml(text) {
        return text.replace(/&/g, '&amp;')
                   .replace(/</g, '&lt;')
                   .replace(/>/g, '&gt;')
                   .replace(/"/g, '&quot;')
                   .replace(/'/g, '&apos;');
    }
    
    layoutNodes(width, height, nodeWidth, nodeHeight) {
        const margin = 60;
        const verticalSpacing = 130;
        
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].x = (width - nodeWidth) / 2;
            this.nodes[i].y = margin + i * verticalSpacing;
        }
    }
}

// Universal Syntax Translator
class UniversalSyntaxTranslator {
    constructor() {
        this.translators = {
            python: new PythonTranslator(),
            java: new JavaTranslator(),
            javascript: new JavaScriptTranslator(),
            cpp: new CppTranslator()
        };
    }
    
    translateProgram(statements, targetLanguage) {
        if (!this.translators[targetLanguage]) {
            throw new Error(`Unsupported target language: ${targetLanguage}`);
        }
        return this.translators[targetLanguage].translateProgram(statements);
    }
}

// Base Translator
class BaseTranslator {
    constructor() {
        this.indentLevel = 0;
        this.indentChar = '    ';
    }
    
    indent() {
        return this.indentChar.repeat(this.indentLevel);
    }
    
    increaseIndent() {
        this.indentLevel++;
    }
    
    decreaseIndent() {
        this.indentLevel = Math.max(0, this.indentLevel - 1);
    }
    
    translateProgram(statements) {
        this.indentLevel = 0;
        let code = this.getHeader();
        
        for (const statement of statements) {
            code += this.translateStatement(statement);
        }
        
        code += this.getFooter();
        return code;
    }
    
    translateStatement(statement) {
        switch (statement.type) {
            case 'VariableDeclaration':
                return this.indent() + this.translateVariableDeclaration(statement) + '\n';
            case 'AssignmentStatement':
                return this.indent() + this.translateAssignmentStatement(statement) + '\n';
            case 'OutputStatement':
                return this.indent() + this.translateOutputStatement(statement) + '\n';
            case 'ConditionalStatement':
                return this.translateConditionalStatement(statement);
            case 'WhileLoop':
                return this.translateWhileLoop(statement);
            case 'FunctionDefinition':
                return this.translateFunctionDefinition(statement);
            case 'FunctionCall':
                return this.indent() + this.translateFunctionCall(statement) + '\n';
            case 'ReturnStatement':
                return this.indent() + this.translateReturnStatement(statement) + '\n';
            default:
                return this.indent() + `// Unknown: ${statement.type}\n`;
        }
    }
}

// Python Translator
class PythonTranslator extends BaseTranslator {
    getHeader() {
        return '# Translated from FlowScript to Python\n\n';
    }
    
    getFooter() {
        return '';
    }
    
    translateVariableDeclaration(statement) {
        return `${statement.identifier} = ${this.translateExpression(statement.value)}`;
    }
    
    translateAssignmentStatement(statement) {
        return `${statement.identifier} = ${this.translateExpression(statement.value)}`;
    }
    
    translateOutputStatement(statement) {
        return `print(${this.translateExpression(statement.expression)})`;
    }
    
    translateConditionalStatement(statement) {
        let code = this.indent() + `if ${this.translateExpression(statement.condition)}:\n`;
        this.increaseIndent();
        
        for (const stmt of statement.thenBody) {
            code += this.translateStatement(stmt);
        }
        
        this.decreaseIndent();
        
        if (statement.elseBody && statement.elseBody.length > 0) {
            code += this.indent() + 'else:\n';
            this.increaseIndent();
            for (const stmt of statement.elseBody) {
                code += this.translateStatement(stmt);
            }
            this.decreaseIndent();
        }
        
        return code;
    }
    
    translateWhileLoop(statement) {
        let code = this.indent() + `while ${this.translateExpression(statement.condition)}:\n`;
        this.increaseIndent();
        
        for (const stmt of statement.body) {
            code += this.translateStatement(stmt);
        }
        
        this.decreaseIndent();
        return code;
    }
    
    translateFunctionDefinition(statement) {
        const params = statement.parameters.join(', ');
        let code = this.indent() + `def ${statement.name}(${params}):\n`;
        this.increaseIndent();
        
        if (statement.body.length === 0) {
            code += this.indent() + 'pass\n';
        } else {
            for (const stmt of statement.body) {
                code += this.translateStatement(stmt);
            }
        }
        
        this.decreaseIndent();
        return code + '\n';
    }
    
    translateFunctionCall(statement) {
        const args = statement.arguments.map(arg => this.translateExpression(arg)).join(', ');
        return `${statement.name}(${args})`;
    }
    
    translateReturnStatement(statement) {
        return `return ${this.translateExpression(statement.expression)}`;
    }
    
    translateExpression(expr) {
        if (!expr) return 'None';
        
        if (expr.type === 'Literal') {
            if (Array.isArray(expr.value)) {
                const items = expr.value.map(v => {
                    if (typeof v === 'object' && v.type === 'Literal') {
                        return this.translateLiteral(v.value);
                    }
                    return this.translateLiteral(v);
                });
                return `[${items.join(', ')}]`;
            }
            return this.translateLiteral(expr.value);
        }
        
        if (expr.type === 'Identifier') return expr.name;
        
        if (expr.type === 'BinaryExpression') {
            const left = this.translateExpression(expr.left);
            const right = this.translateExpression(expr.right);
            return this.translateBinaryOp(expr.operator, left, right);
        }
        
        if (expr.type === 'FunctionCall') {
            const args = expr.arguments.map(arg => this.translateExpression(arg)).join(', ');
            return `${expr.name}(${args})`;
        }
        
        if (expr.type === 'ArrayAccess') {
            const arr = this.translateExpression(expr.array);
            const idx = this.translateExpression(expr.index);
            return `${arr}[${idx}]`;
        }
        
        return 'None';
    }
    
    translateLiteral(value) {
        if (typeof value === 'string') return `"${value}"`;
        if (typeof value === 'boolean') return value ? 'True' : 'False';
        return String(value);
    }
    
    translateBinaryOp(op, left, right) {
        const opMap = {
            'plus': '+', 'minus': '-', 'times': '*', 'divided by': '/',
            'is greater than': '>', 'is less than': '<', 'equals': '==',
            '>=': '>=', '<=': '<=', '!=': '!=', 'and': 'and', 'or': 'or'
        };
        const operator = opMap[op] || op;
        return `${left} ${operator} ${right}`;
    }
}

// Java Translator
class JavaTranslator extends BaseTranslator {
    constructor() {
        super();
        this.indentLevel = 2;
    }
    
    getHeader() {
        return '// Translated from FlowScript to Java\nimport java.util.*;\n\npublic class FlowScriptProgram {\n    public static void main(String[] args) {\n';
    }
    
    getFooter() {
        return '    }\n}\n';
    }
    
    translateVariableDeclaration(statement) {
        const type = this.getJavaType(statement.dataType);
        return `${type} ${statement.identifier} = ${this.translateExpression(statement.value)};`;
    }
    
    translateAssignmentStatement(statement) {
        return `${statement.identifier} = ${this.translateExpression(statement.value)};`;
    }
    
    translateOutputStatement(statement) {
        return `System.out.println(${this.translateExpression(statement.expression)});`;
    }
    
    translateConditionalStatement(statement) {
        let code = this.indent() + `if (${this.translateExpression(statement.condition)}) {\n`;
        this.increaseIndent();
        
        for (const stmt of statement.thenBody) {
            code += this.translateStatement(stmt);
        }
        
        this.decreaseIndent();
        code += this.indent() + '}';
        
        if (statement.elseBody && statement.elseBody.length > 0) {
            code += ' else {\n';
            this.increaseIndent();
            for (const stmt of statement.elseBody) {
                code += this.translateStatement(stmt);
            }
            this.decreaseIndent();
            code += this.indent() + '}';
        }
        
        return code + '\n';
    }
    
    translateWhileLoop(statement) {
        let code = this.indent() + `while (${this.translateExpression(statement.condition)}) {\n`;
        this.increaseIndent();
        
        for (const stmt of statement.body) {
            code += this.translateStatement(stmt);
        }
        
        this.decreaseIndent();
        code += this.indent() + '}\n';
        return code;
    }
    
    translateFunctionDefinition(statement) {
        const params = statement.parameters.map(p => `Object ${p}`).join(', ');
        let code = this.indent() + `public static Object ${statement.name}(${params}) {\n`;
        this.increaseIndent();
        
        for (const stmt of statement.body) {
            code += this.translateStatement(stmt);
        }
        
        this.decreaseIndent();
        code += this.indent() + '}\n\n';
        return code;
    }
    
    translateFunctionCall(statement) {
        const args = statement.arguments.map(arg => this.translateExpression(arg)).join(', ');
        return `${statement.name}(${args});`;
    }
    
    translateReturnStatement(statement) {
        return `return ${this.translateExpression(statement.expression)};`;
    }
    
    getJavaType(flowType) {
        const typeMap = {
            'number': 'double', 'text': 'String', 'boolean': 'boolean',
            'list': 'ArrayList<Object>', 'auto': 'Object'
        };
        return typeMap[flowType] || 'Object';
    }
    
    translateExpression(expr) {
        if (!expr) return 'null';
        
        if (expr.type === 'Literal') {
            if (Array.isArray(expr.value)) {
                const items = expr.value.map(v => {
                    if (typeof v === 'object' && v.type === 'Literal') {
                        return this.translateLiteral(v.value);
                    }
                    return this.translateLiteral(v);
                });
                return `new ArrayList<>(Arrays.asList(${items.join(', ')}))`;
            }
            return this.translateLiteral(expr.value);
        }
        
        if (expr.type === 'Identifier') return expr.name;
        
        if (expr.type === 'BinaryExpression') {
            const left = this.translateExpression(expr.left);
            const right = this.translateExpression(expr.right);
            return this.translateBinaryOp(expr.operator, left, right);
        }
        
        if (expr.type === 'FunctionCall') {
            const args = expr.arguments.map(arg => this.translateExpression(arg)).join(', ');
            return `${expr.name}(${args})`;
        }
        
        if (expr.type === 'ArrayAccess') {
            const arr = this.translateExpression(expr.array);
            const idx = this.translateExpression(expr.index);
            return `${arr}.get((int)${idx})`;
        }
        
        return 'null';
    }
    
    translateLiteral(value) {
        if (typeof value === 'string') return `"${value}"`;
        if (typeof value === 'boolean') return String(value);
        return String(value);
    }
    
    translateBinaryOp(op, left, right) {
        if (op === 'plus') {
            return `String.valueOf(${left}) + String.valueOf(${right})`;
        }
        const opMap = {
            'minus': '-', 'times': '*', 'divided by': '/',
            'is greater than': '>', 'is less than': '<', 'equals': '==',
            '>=': '>=', '<=': '<=', '!=': '!=', 'and': '&&', 'or': '||'
        };
        const operator = opMap[op] || op;
        return `(${left} ${operator} ${right})`;
    }
}

// JavaScript Translator
class JavaScriptTranslator extends BaseTranslator {
    getHeader() {
        return '// Translated from FlowScript to JavaScript\n\n';
    }
    
    getFooter() {
        return '';
    }
    
    translateVariableDeclaration(statement) {
        return `let ${statement.identifier} = ${this.translateExpression(statement.value)};`;
    }
    
    translateAssignmentStatement(statement) {
        return `${statement.identifier} = ${this.translateExpression(statement.value)};`;
    }
    
    translateOutputStatement(statement) {
        return `console.log(${this.translateExpression(statement.expression)});`;
    }
    
    translateConditionalStatement(statement) {
        let code = this.indent() + `if (${this.translateExpression(statement.condition)}) {\n`;
        this.increaseIndent();
        
        for (const stmt of statement.thenBody) {
            code += this.translateStatement(stmt);
        }
        
        this.decreaseIndent();
        code += this.indent() + '}';
        
        if (statement.elseBody && statement.elseBody.length > 0) {
            code += ' else {\n';
            this.increaseIndent();
            for (const stmt of statement.elseBody) {
                code += this.translateStatement(stmt);
            }
            this.decreaseIndent();
            code += this.indent() + '}';
        }
        
        return code + '\n';
    }
    
    translateWhileLoop(statement) {
        let code = this.indent() + `while (${this.translateExpression(statement.condition)}) {\n`;
        this.increaseIndent();
        
        for (const stmt of statement.body) {
            code += this.translateStatement(stmt);
        }
        
        this.decreaseIndent();
        code += this.indent() + '}\n';
        return code;
    }
    
    translateFunctionDefinition(statement) {
        const params = statement.parameters.join(', ');
        let code = this.indent() + `function ${statement.name}(${params}) {\n`;
        this.increaseIndent();
        
        for (const stmt of statement.body) {
            code += this.translateStatement(stmt);
        }
        
        this.decreaseIndent();
        code += this.indent() + '}\n\n';
        return code;
    }
    
    translateFunctionCall(statement) {
        const args = statement.arguments.map(arg => this.translateExpression(arg)).join(', ');
        return `${statement.name}(${args});`;
    }
    
    translateReturnStatement(statement) {
        return `return ${this.translateExpression(statement.expression)};`;
    }
    
    translateExpression(expr) {
        if (!expr) return 'null';
        
        if (expr.type === 'Literal') {
            if (Array.isArray(expr.value)) {
                const items = expr.value.map(v => {
                    if (typeof v === 'object' && v.type === 'Literal') {
                        return this.translateLiteral(v.value);
                    }
                    return this.translateLiteral(v);
                });
                return `[${items.join(', ')}]`;
            }
            return this.translateLiteral(expr.value);
        }
        
        if (expr.type === 'Identifier') return expr.name;
        
        if (expr.type === 'BinaryExpression') {
            const left = this.translateExpression(expr.left);
            const right = this.translateExpression(expr.right);
            return this.translateBinaryOp(expr.operator, left, right);
        }
        
        if (expr.type === 'FunctionCall') {
            const args = expr.arguments.map(arg => this.translateExpression(arg)).join(', ');
            return `${expr.name}(${args})`;
        }
        
        if (expr.type === 'ArrayAccess') {
            const arr = this.translateExpression(expr.array);
            const idx = this.translateExpression(expr.index);
            return `${arr}[${idx}]`;
        }
        
        return 'null';
    }
    
    translateLiteral(value) {
        if (typeof value === 'string') return `"${value}"`;
        if (typeof value === 'boolean') return String(value);
        return String(value);
    }
    
    translateBinaryOp(op, left, right) {
        const opMap = {
            'plus': '+',
            'minus': '-', 
            'times': '*', 
            'divided by': '/',
            'is greater than': '>', 
            'is less than': '<', 
            'equals': '===',
            '>=': '>=', 
            '<=': '<=', 
            '!=': '!==', 
            'and': '&&', 
            'or': '||'
        };
        const operator = opMap[op] || op;
        return `((${left}) ${operator} (${right}))`;
    }
}

// C++ Translator
class CppTranslator extends BaseTranslator {
    constructor() {
        super();
        this.indentLevel = 1;
    }
    
    getHeader() {
        return '// Translated from FlowScript to C++\n#include <iostream>\n#include <string>\n#include <vector>\nusing namespace std;\n\nint main() {\n';
    }
    
    getFooter() {
        return '    return 0;\n}\n';
    }
    
    translateVariableDeclaration(statement) {
        const type = this.getCppType(statement.dataType);
        return `${type} ${statement.identifier} = ${this.translateExpression(statement.value)};`;
    }
    
    translateAssignmentStatement(statement) {
        return `${statement.identifier} = ${this.translateExpression(statement.value)};`;
    }
    
    translateOutputStatement(statement) {
        return `cout << ${this.translateExpression(statement.expression)} << endl;`;
    }
    
    translateConditionalStatement(statement) {
        let code = this.indent() + `if (${this.translateExpression(statement.condition)}) {\n`;
        this.increaseIndent();
        
        for (const stmt of statement.thenBody) {
            code += this.translateStatement(stmt);
        }
        
        this.decreaseIndent();
        code += this.indent() + '}';
        
        if (statement.elseBody && statement.elseBody.length > 0) {
            code += ' else {\n';
            this.increaseIndent();
            for (const stmt of statement.elseBody) {
                code += this.translateStatement(stmt);
            }
            this.decreaseIndent();
            code += this.indent() + '}';
        }
        
        return code + '\n';
    }
    
    translateWhileLoop(statement) {
        let code = this.indent() + `while (${this.translateExpression(statement.condition)}) {\n`;
        this.increaseIndent();
        
        for (const stmt of statement.body) {
            code += this.translateStatement(stmt);
        }
        
        this.decreaseIndent();
        code += this.indent() + '}\n';
        return code;
    }
    
    translateFunctionDefinition(statement) {
        const params = statement.parameters.map(p => `auto ${p}`).join(', ');
        let code = this.indent() + `auto ${statement.name}(${params}) {\n`;
        this.increaseIndent();
        
        for (const stmt of statement.body) {
            code += this.translateStatement(stmt);
        }
        
        this.decreaseIndent();
        code += this.indent() + '}\n\n';
        return code;
    }
    
    translateFunctionCall(statement) {
        const args = statement.arguments.map(arg => this.translateExpression(arg)).join(', ');
        return `${statement.name}(${args});`;
    }
    
    translateReturnStatement(statement) {
        return `return ${this.translateExpression(statement.expression)};`;
    }
    
    getCppType(flowType) {
        const typeMap = {
            'number': 'double', 'text': 'string', 'boolean': 'bool',
            'list': 'vector<double>', 'auto': 'auto'
        };
        return typeMap[flowType] || 'auto';
    }
    
    translateExpression(expr) {
        if (!expr) return 'nullptr';
        
        if (expr.type === 'Literal') {
            if (Array.isArray(expr.value)) {
                const items = expr.value.map(v => {
                    if (typeof v === 'object' && v.type === 'Literal') {
                        return this.translateLiteral(v.value);
                    }
                    return this.translateLiteral(v);
                });
                return `vector<double>{${items.join(', ')}}`;
            }
            return this.translateLiteral(expr.value);
        }
        
        if (expr.type === 'Identifier') return expr.name;
        
        if (expr.type === 'BinaryExpression') {
            const left = this.translateExpression(expr.left);
            const right = this.translateExpression(expr.right);
            return this.translateBinaryOp(expr.operator, left, right);
        }
        
        if (expr.type === 'FunctionCall') {
            const args = expr.arguments.map(arg => this.translateExpression(arg)).join(', ');
            return `${expr.name}(${args})`;
        }
        
        if (expr.type === 'ArrayAccess') {
            const arr = this.translateExpression(expr.array);
            const idx = this.translateExpression(expr.index);
            return `${arr}[${idx}]`;
        }
        
        return 'nullptr';
    }
    
    translateLiteral(value) {
        if (typeof value === 'string') return `"${value}"`;
        if (typeof value === 'boolean') return value ? 'true' : 'false';
        return String(value);
    }
    
    translateBinaryOp(op, left, right) {
        if (op === 'plus') {
            return `(to_string(${left}) + to_string(${right}))`;
        }
        const opMap = {
            'minus': '-', 'times': '*', 'divided by': '/',
            'is greater than': '>', 'is less than': '<', 'equals': '==',
            '>=': '>=', '<=': '<=', '!=': '!=', 'and': '&&', 'or': '||'
        };
        const operator = opMap[op] || op;
        return `(${left} ${operator} ${right})`;
    }
}

// FlowScript IDE Application
class EnhancedFlowScriptIDE {
    constructor() {
        this.editor = document.getElementById('codeEditor');
        this.output = document.getElementById('output');
        this.astDisplay = document.getElementById('astDisplay');
        this.variablesDisplay = document.getElementById('variablesDisplay');
        this.tokensDisplay = document.getElementById('tokensDisplay');
        this.translationsDisplay = document.getElementById('translationsDisplay');
        this.flowchartDisplay = document.getElementById('flowchartDisplay');
        this.languageSelect = document.getElementById('languageSelect');
        this.statusText = document.getElementById('statusText');
        this.executionTime = document.getElementById('executionTime');
        this.lineNumbers = document.getElementById('lineNumbers');
        this.lineCount = document.getElementById('lineCount');
        this.fontSize = document.getElementById('fontSize');
        this.toggleManual = document.getElementById('toggleManual');
        
        this.interpreter = new AdvancedFlowScriptInterpreter();
        this.currentStatements = [];
        this.isDebugging = false;
        this.debugStepIndex = 0;
        this.debugStatements = [];
        this.currentFlowchart = null;
        this.manualVisible = true;
        
        window.flowScriptIDE = this;
        
        this.initializeEventListeners();
        this.updateLineNumbers();
        this.initializeSyntaxHighlighting();
        this.addExamplesScrolling();
    }
    
    addExamplesScrolling() {
        const style = document.createElement('style');
        style.textContent = `
            .examples-grid {
                max-height: 60vh;
                overflow-y: auto;
                padding-right: 10px;
            }
            .examples-grid::-webkit-scrollbar {
                width: 8px;
            }
            .examples-grid::-webkit-scrollbar-track {
                background: #1e293b;
                border-radius: 4px;
            }
            .examples-grid::-webkit-scrollbar-thumb {
                background: #475569;
                border-radius: 4px;
            }
            .examples-grid::-webkit-scrollbar-thumb:hover {
                background: #64748b;
            }
        `;
        document.head.appendChild(style);
    }
    
    initializeEventListeners() {
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
        
        document.getElementById('runBtn').addEventListener('click', () => this.runProgram());
        document.getElementById('stepBtn').addEventListener('click', () => this.stepDebugger());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseDebugger());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopDebugger());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearEditor());
        document.getElementById('clearOutputBtn').addEventListener('click', () => this.clearOutput());
        document.getElementById('formatBtn').addEventListener('click', () => this.formatCode());
        document.getElementById('examplesBtn').addEventListener('click', () => this.showExamples());
        this.fontSize.addEventListener('change', () => this.updateFontSize());
        this.toggleManual.addEventListener('click', () => this.toggleManualVisibility());
        const copyOutputBtn = document.getElementById('copyOutputBtn');
        if (copyOutputBtn) {
            copyOutputBtn.addEventListener('click', () => this.copyFromElement(this.output));
        }
        
        this.languageSelect.addEventListener('change', () => this.updateTranslation());
        const copyTranslationBtn = document.getElementById('copyTranslationBtn');
        if (copyTranslationBtn) {
            copyTranslationBtn.addEventListener('click', () => this.copyFromElement(this.translationsDisplay));
        }
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        
        document.getElementById('closeModal').addEventListener('click', () => this.hideExamples());
        document.getElementById('examplesModal').addEventListener('click', (e) => {
            if (e.target.id === 'examplesModal') this.hideExamples();
        });
        
        this.loadExampleCards();
    }

    copyFromElement(el) {
        if (!el) return;
        const text = el.innerText || el.textContent || '';
        if (!text.trim()) return;
        navigator.clipboard.writeText(text).then(() => {
            this.setStatus('Copied to clipboard');
        }).catch(() => {
            this.setStatus('Copy failed');
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
    
    runProgram() {
        const code = this.editor.value.trim();
        if (!code) {
            this.showError('Please enter some FlowScript code to run.');
            return;
        }
        
        this.setStatus('Running...', true);
        this.clearOutput();
        
        const startTime = performance.now();
        
        try {
            const result = this.interpreter.interpret(code);
            const tokens = this.interpreter.tokenize(code);
            const ast = this.generateAST(result.statements);
            
            this.currentStatements = result.statements;
            
            this.showOutput(result.output);
            this.showVariables(result.variables, result.functions);
            this.showTokens(tokens);
            this.showAST(ast);
            this.showFlowchart(result.statements);
            this.updateTranslation();
            
            const endTime = performance.now();
            const executionTime = (endTime - startTime).toFixed(2);
            
            this.setStatus('Execution completed');
            this.executionTime.textContent = `${executionTime}ms`;
            
        } catch (error) {
            this.showError(`Error: ${error.message}`);
            this.setStatus('Execution failed');
        }
    }
    
    showFlowchart(statements) {
        if (!statements || statements.length === 0) {
            this.flowchartDisplay.innerHTML = 'No flowchart to display. Run a program first.';
            return;
        }
        
        try {
            const flowchartData = this.interpreter.generateFlowchart(statements);
            if (flowchartData) {
                const svg = this.interpreter.flowchartGenerator.generateSVG();
                this.flowchartDisplay.innerHTML = svg;
                this.currentFlowchart = flowchartData;
                
                setTimeout(() => {
                    this.makeFlowchartInteractive();
                }, 100);
            } else {
                this.flowchartDisplay.innerHTML = 'Unable to generate flowchart for this program.';
            }
        } catch (error) {
            this.flowchartDisplay.innerHTML = `Flowchart generation error: ${error.message}`;
        }
    }
    
    updateTranslation() {
        if (!this.currentStatements || this.currentStatements.length === 0) {
            this.translationsDisplay.textContent = 'Run a program first to see translations...';
            return;
        }
        
        try {
            const selectedLanguage = this.languageSelect.value;
            const translation = this.interpreter.translateTo(selectedLanguage, this.currentStatements);
            
            this.translationsDisplay.innerHTML = '';
            const pre = document.createElement('pre');
            const code = document.createElement('code');
            code.textContent = translation;
            code.className = `language-${selectedLanguage}`;
            pre.appendChild(code);
            this.translationsDisplay.appendChild(pre);
            
        } catch (error) {
            this.translationsDisplay.textContent = `Translation error: ${error.message}`;
        }
    }
    
    generateAST(statements) {
        return { type: 'Program', statements: statements };
    }
    
    showOutput(outputLines) {
        this.output.innerHTML = '';
        
        if (outputLines.length === 0) {
            this.output.innerHTML = '<div class="output-line">No output generated.</div>';
            return;
        }
        
        outputLines.forEach(line => {
            const div = document.createElement('div');
            div.className = line.startsWith('Error:') ? 'error-message' : 'output-line';
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
        
        if (node.original) {
            const contentSpan = document.createElement('span');
            contentSpan.className = 'ast-node-content';
            contentSpan.textContent = ` - ${node.original}`;
            div.appendChild(contentSpan);
        }
        
        container.appendChild(div);
        
        if (node.statements) {
            node.statements.forEach(stmt => this.renderASTNode(stmt, container, depth + 1));
        }
        if (node.thenBody) {
            node.thenBody.forEach(stmt => this.renderASTNode(stmt, container, depth + 1));
        }
        if (node.elseBody) {
            node.elseBody.forEach(stmt => this.renderASTNode(stmt, container, depth + 1));
        }
        if (node.body) {
            node.body.forEach(stmt => this.renderASTNode(stmt, container, depth + 1));
        }
    }
    
    showVariables(variables, functions) {
        this.variablesDisplay.innerHTML = '';
        
        if (Object.keys(variables).length > 0) {
            const varHeader = document.createElement('div');
            varHeader.style.cssText = 'font-weight: bold; margin-bottom: 0.5rem; color: #4f46e5;';
            varHeader.textContent = 'Variables:';
            this.variablesDisplay.appendChild(varHeader);
            
            Object.entries(variables).forEach(([name, info]) => {
                const div = document.createElement('div');
                div.className = 'variable-item';
                
                let valueStr = JSON.stringify(info.value);
                if (Array.isArray(info.value)) {
                    valueStr = `[${info.value.join(', ')}]`;
                }
                
                div.innerHTML = `
                    <div>
                        <span class="variable-name">${name}</span>
                        <span class="variable-type">${info.type}</span>
                    </div>
                    <span class="variable-value">${valueStr}</span>
                `;
                
                this.variablesDisplay.appendChild(div);
            });
        }
        
        if (Object.keys(functions).length > 0) {
            const funcHeader = document.createElement('div');
            funcHeader.style.cssText = 'font-weight: bold; margin: 1rem 0 0.5rem; color: #4f46e5;';
            funcHeader.textContent = 'Functions:';
            this.variablesDisplay.appendChild(funcHeader);
            
            Object.entries(functions).forEach(([name, func]) => {
                const div = document.createElement('div');
                div.className = 'variable-item';
                div.innerHTML = `<span class="variable-name">${name}(${func.parameters.join(', ')})</span>`;
                this.variablesDisplay.appendChild(div);
            });
        }
        
        if (Object.keys(variables).length === 0 && Object.keys(functions).length === 0) {
            this.variablesDisplay.innerHTML = '<div class="output-line">No variables or functions defined.</div>';
        }
    }
    
    showError(message) {
        this.output.innerHTML = '';
        const div = document.createElement('div');
        div.className = 'error-message';
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
        this.currentStatements = [];
    }
    
    clearOutput() {
        this.output.innerHTML = 'Ready to run advanced FlowScript programs...';
        this.astDisplay.innerHTML = 'AST will appear here after parsing...';
        this.variablesDisplay.innerHTML = 'Variables and functions will appear here...';
        this.tokensDisplay.innerHTML = 'Tokens will appear here...';
        this.translationsDisplay.innerHTML = 'Translations will appear here...';
        this.flowchartDisplay.innerHTML = 'Flowchart will appear here after running...';
    }
    
    formatCode() {
        const lines = this.editor.value.split('\n');
        const formatted = lines.map(line => line.trim()).filter(line => line).join('\n');
        this.editor.value = formatted;
        this.updateLineNumbers();
        this.updateLineCount();
    }
    
    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });
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
    
    loadExampleCards() {
        const examplesContainer = document.querySelector('.examples-grid');
        if (!examplesContainer) return;
        
        examplesContainer.innerHTML = `
            <div class="example-card" data-example="variables-basics">
                <h3>Variables Basics</h3>
                <p>Learn about data types and variables</p>
            </div>
            <div class="example-card" data-example="arithmetic">
                <h3>Arithmetic Operations</h3>
                <p>Basic math operations</p>
            </div>
            <div class="example-card" data-example="comparison">
                <h3>Comparison Operations</h3>
                <p>Greater than, less than, equals</p>
            </div>
            <div class="example-card" data-example="logical-operators">
                <h3>Logical Operators</h3>
                <p>AND, OR logic tests</p>
            </div>
            <div class="example-card" data-example="conditionals">
                <h3>Complex Conditionals</h3>
                <p>Nested if-else, logical operators</p>
            </div>
            <div class="example-card" data-example="loops">
                <h3>Advanced Loops</h3>
                <p>While loops, for-each, nested iterations</p>
            </div>
            <div class="example-card" data-example="functions">
                <h3>Functions & Recursion</h3>
                <p>Function definitions and calls</p>
            </div>
            <div class="example-card" data-example="arrays">
                <h3>Arrays & Data Structures</h3>
                <p>Lists, arrays, and data manipulation</p>
            </div>
            <div class="example-card" data-example="fibonacci">
                <h3>Fibonacci Sequence</h3>
                <p>Classic recursive algorithm</p>
            </div>
            <div class="example-card" data-example="array-operations">
                <h3>Array Operations</h3>
                <p>Sum, average, array processing</p>
            </div>
            <div class="example-card" data-example="string-operations">
                <h3>String Manipulation</h3>
                <p>Concatenation and text processing</p>
            </div>
            <div class="example-card" data-example="mathematical">
                <h3>Mathematical Computations</h3>
                <p>Square, cube, power functions</p>
            </div>
            <div class="example-card" data-example="nested-loops">
                <h3>Nested Loops</h3>
                <p>Multiplication tables and patterns</p>
            </div>
            <div class="example-card" data-example="complete">
                <h3>Complete Application</h3>
                <p>Full program with all features</p>
            </div>
        `;
        
        document.querySelectorAll('.example-card').forEach(card => {
            card.addEventListener('click', () => {
                this.loadExample(card.dataset.example);
            });
        });
    }
    
    loadExample(exampleName) {
        const examples = {
            'functions': `# Functions Example
Define function factorial with parameter n:
    if n <= 1 then return 1
    else:
        Create a number called result with value 1
        Create a number called i with value 1
        while i <= n:
            result = result times i
            increase i by 1
        return result

Create a number called num with value 5
say "Factorial of 5:"
Create a number called answer with value factorial(num)
say answer`,
            
            'arrays': `# Arrays and Data Structures
Create a list called numbers with values [10, 20, 30, 40, 50]
say "Array contents:"
say numbers
say "First element:"
say numbers[0]
say "Third element:"
say numbers[2]

Create a list called names with values ["Alice", "Bob", "Charlie"]
say "Names list:"
say names
say "Second name:"
say names[1]`,
            
            'loops': `# Advanced Loops
Create a number called counter with value 0
say "Counting to 10:"
while counter < 10:
    say counter
    increase counter by 1
say "Loop complete!"

Create a number called sum with value 0
Create a number called i with value 1
while i <= 5:
    sum = sum plus i
    increase i by 1
say "Sum from 1 to 5:"
say sum`,
            
            'conditionals': `# Complex Conditionals
Create a number called age with value 25
Create a number called score with value 85

if age >= 18 and score >= 80:
    say "Excellent performance!"
else:
    say "Keep trying!"

if score >= 90:
    say "Grade: A"
else:
    if score >= 80:
        say "Grade: B"
    else:
        if score >= 70:
            say "Grade: C"
        else:
            say "Grade: F"`,
            
            'complete': `# Complete Application
say "=== Calculator Program ==="

Define function add with parameter x:
    return x plus 10

Define function multiply with parameter x:
    return x times 2

Create a number called counter with value 1
while counter <= 5:
    Create a number called doubled with value multiply(counter)
    Create a number called added with value add(counter)
    
    say "Number:"
    say counter
    say "Doubled:"
    say doubled
    say "Plus 10:"
    say added
    
    if counter is greater than 2:
        say "Greater than 2!"
    
    increase counter by 1

say "=== Program Complete ==="`,

            'fibonacci': `# Fibonacci Sequence
Define function fibonacci with parameter n:
    if n <= 1 then return n
    else:
        Create a number called prev with value n minus 1
        Create a number called prev2 with value n minus 2
        Create a number called fib1 with value fibonacci(prev)
        Create a number called fib2 with value fibonacci(prev2)
        return fib1 plus fib2

say "Fibonacci Sequence (first 8 numbers):"
Create a number called i with value 0
while i < 8:
    Create a number called fib with value fibonacci(i)
    say fib
    increase i by 1`,

            'array-operations': `# Array Operations
Create a list called scores with values [85, 92, 78, 95, 88]
say "Student Scores:"
say scores

Create a number called total with value 0
Create a number called idx with value 0
while idx < 5:
    Create a number called current with value scores[idx]
    say current
    total = total plus current
    increase idx by 1

Create a number called average with value total divided by 5
say "Total:"
say total
say "Average:"
say average`,

            'string-operations': `# String Manipulation
Create a text called firstName with value "John"
Create a text called lastName with value "Doe"
Create a text called greeting with value "Hello"

say firstName
say lastName

Create a text called fullName with value greeting
fullName = fullName plus " "
fullName = fullName plus firstName
fullName = fullName plus " "
fullName = fullName plus lastName

say "Full greeting:"
say fullName`,

            'mathematical': `# Mathematical Computations
say "=== Math Calculator ==="

Define function square with parameter n:
    return n times n

Define function cube with parameter n:
    Create a number called sq with value n times n
    return sq times n

Create a number called num with value 5
say "Number:"
say num
say "Square:"
say square(num)
say "Cube:"
say cube(num)

Create a number called a with value 3
Create a number called b with value 4
Create a number called sumSquares with value square(a) plus square(b)
say "Sum of squares of 3 and 4:"
say sumSquares`,

            'nested-loops': `# Nested Loop Pattern
say "Multiplication Table (1-5):"
Create a number called i with value 1
while i <= 5:
    Create a number called j with value 1
    while j <= 5:
        Create a number called product with value i times j
        say product
        increase j by 1
    say "---"
    increase i by 1`,

            'variables-basics': `# Variables and Data Types
say "=== Learning Variables ==="

Create a number called age with value 25
say "Age:"
say age

Create a text called name with value "Alice"
say "Name:"
say name

Create a boolean called isStudent with value true
say "Is student:"
say isStudent

age = 26
say "New age:"
say age`,

            'arithmetic': `# Arithmetic Operations
say "=== Basic Math ==="

Create a number called x with value 10
Create a number called y with value 3

Create a number called sum with value x plus y
Create a number called diff with value x minus y
Create a number called prod with value x times y
Create a number called quot with value x divided by y

say "X:"
say x
say "Y:"
say y
say "Sum:"
say sum
say "Difference:"
say diff
say "Product:"
say prod
say "Quotient:"
say quot`,

            'comparison': `# Comparison Operations
say "=== Comparison Tests ==="

Create a number called a with value 10
Create a number called b with value 20

if a is less than b:
    say "A is less than B"

if b is greater than a:
    say "B is greater than A"

if a equals a:
    say "A equals A"

Create a number called x with value 15
if x >= 10 and x <= 20:
    say "X is between 10 and 20"`,

            'logical-operators': `# Logical Operations
say "=== Logic Tests ==="

Create a boolean called hasLicense with value true
Create a number called age with value 20

if age >= 18 and hasLicense equals true:
    say "Can drive!"
else:
    say "Cannot drive!"

Create a boolean called isWeekend with value false
Create a boolean called isHoliday with value true

if isWeekend equals true or isHoliday equals true:
    say "Time to relax!"
else:
    say "Time to work!"`
        };
        
        if (examples[exampleName]) {
            this.editor.value = examples[exampleName];
            this.updateLineNumbers();
            this.updateLineCount();
            this.hideExamples();
            this.setStatus(`Loaded example: ${exampleName}`);
        }
    }

    initializeSyntaxHighlighting() {
        this.editor.addEventListener('input', () => {
            this.applySyntaxHighlighting();
        });
        this.applySyntaxHighlighting();
    }

    applySyntaxHighlighting() {
        // Placeholder for syntax highlighting
    }

    updateFontSize() {
        const fontSize = this.fontSize.value;
        this.editor.style.fontSize = fontSize;
        this.lineNumbers.style.fontSize = fontSize;
    }

    startDebugger() {
        const code = this.editor.value.trim();
        if (!code) {
            this.showError('Please enter some FlowScript code to debug.');
            return;
        }
        
        this.isDebugging = true;
        this.debugStepIndex = 0;
        this.debugStatements = this.interpreter.parseToStatements(code);
        
        document.body.classList.add('debugger-active');
        this.setStatus('Debugger ready - click Step to begin');
    }

    stepDebugger() {
        if (!this.isDebugging) {
            this.startDebugger();
            return;
        }
        
        if (this.debugStepIndex >= this.debugStatements.length) {
            this.setStatus('Debugging completed');
            this.stopDebugger();
            return;
        }
        
        const statement = this.debugStatements[this.debugStepIndex];
        this.highlightCurrentLine(statement.line);
        this.executeDebugStatement(statement);
        
        this.debugStepIndex++;
        this.setStatus(`Step ${this.debugStepIndex}/${this.debugStatements.length}: ${statement.original}`);
    }

    pauseDebugger() {
        this.isDebugging = false;
        this.setStatus('Debugger paused');
    }

    stopDebugger() {
        this.isDebugging = false;
        this.debugStepIndex = 0;
        this.debugStatements = [];
        
        document.body.classList.remove('debugger-active');
        this.setStatus('Debugger stopped');
    }

    executeDebugStatement(statement) {
        try {
            this.interpreter.executeStatement(statement);
            this.showVariables(this.interpreter.variables, this.interpreter.functions);
        } catch (error) {
            this.showError(`Debug error: ${error.message}`);
        }
    }

    highlightCurrentLine(lineNumber) {
        this.setStatus(`Executing line ${lineNumber}`);
    }

    makeFlowchartInteractive() {
        if (!this.currentFlowchart) return;
        
        const svg = this.flowchartDisplay.querySelector('svg');
        if (!svg) return;
        
        const nodes = svg.querySelectorAll('rect, polygon');
        nodes.forEach((node, index) => {
            node.classList.add('flowchart-node');
            node.addEventListener('click', () => this.highlightFlowchartNode(index));
        });
    }

    highlightFlowchartNode(nodeIndex) {
        this.flowchartDisplay.querySelectorAll('.flowchart-node').forEach(node => {
            node.classList.remove('active');
        });
        
        const nodes = this.flowchartDisplay.querySelectorAll('.flowchart-node');
        if (nodes[nodeIndex]) {
            nodes[nodeIndex].classList.add('active');
        }
        
        this.setStatus(`Highlighted flowchart node ${nodeIndex + 1}`);
    }

    toggleManualVisibility() {
        this.manualVisible = !this.manualVisible;
        const sidebar = document.querySelector('.sidebar');
        const main = document.querySelector('.main');
        
        if (this.manualVisible) {
            sidebar.style.display = 'flex';
            main.style.gridTemplateColumns = '300px 1fr 1fr';
            this.toggleManual.textContent = 'Hide';
        } else {
            sidebar.style.display = 'none';
            main.style.gridTemplateColumns = '1fr 1fr';
            this.toggleManual.textContent = 'Show';
        }
    }
}

// Initialize IDE
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedFlowScriptIDE();
});