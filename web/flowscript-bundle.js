// Simplified FlowScript implementation for web
class SimpleFlowScriptLexer {
    constructor(input) {
        this.input = input;
        this.tokens = [];
    }
    
    tokenize() {
        const lines = this.input.split('\n');
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
        const keywords = ['create', 'a', 'number', 'text', 'boolean', 'called', 'with', 'value', 'say', 'display', 'if', 'then', 'repeat', 'times'];
        const operators = ['plus', 'minus', 'times', 'divided', 'by', 'is', 'greater', 'than', 'equals'];
        
        if (keywords.includes(word.toLowerCase())) return 'keyword';
        if (operators.includes(word.toLowerCase())) return 'operator';
        if (/^\d+(\.\d+)?$/.test(word)) return 'number';
        if (word.startsWith('"') && word.endsWith('"')) return 'string';
        if (/^[a-zA-Z_]\w*$/.test(word)) return 'identifier';
        return 'punctuation';
    }
}

class SimpleFlowScriptInterpreter {
    constructor() {
        this.variables = {};
        this.output = [];
    }
    
    interpret(code) {
        this.variables = {};
        this.output = [];
        
        const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith('#'));
        
        for (const line of lines) {
            this.executeLine(line.trim());
        }
        
        return {
            output: this.output,
            variables: this.variables
        };
    }
    
    executeLine(line) {
        const lower = line.toLowerCase();
        
        // Variable declaration
        const varMatch = lower.match(/create a (number|text|boolean) called (\w+) with value (.+)/);
        if (varMatch) {
            const [, type, name, value] = varMatch;
            this.variables[name] = {
                type,
                value: this.parseValue(value, type)
            };
            return;
        }
        
        // Output statements
        const sayMatch = lower.match(/say (.+)/);
        if (sayMatch) {
            const expression = sayMatch[1];
            const result = this.evaluateExpression(expression, line);
            this.output.push(result.toString());
            return;
        }
        
        const displayMatch = lower.match(/display (\w+)/);
        if (displayMatch) {
            const varName = displayMatch[1];
            if (this.variables[varName]) {
                this.output.push(this.variables[varName].value.toString());
            }
            return;
        }
        
        // Simple conditionals
        const ifMatch = lower.match(/if (.+) then (.+)/);
        if (ifMatch) {
            const [, condition, action] = ifMatch;
            if (this.evaluateCondition(condition)) {
                this.executeLine(action);
            }
            return;
        }
        
        // Simple loops
        const loopMatch = lower.match(/repeat (\d+) times: (.+)/);
        if (loopMatch) {
            const [, count, action] = loopMatch;
            const num = parseInt(count);
            for (let i = 0; i < num; i++) {
                this.executeLine(action);
            }
            return;
        }
    }
    
    parseValue(value, type) {
        const cleaned = value.trim().replace(/"/g, '');
        
        switch (type) {
            case 'number':
                return parseFloat(cleaned) || 0;
            case 'boolean':
                return cleaned === 'true';
            default:
                return cleaned;
        }
    }
    
    evaluateExpression(expr, originalLine) {
        // Handle quoted strings
        if (expr.includes('"')) {
            let result = expr;
            
            // Replace variables
            Object.keys(this.variables).forEach(varName => {
                const regex = new RegExp(`\\b${varName}\\b`, 'g');
                result = result.replace(regex, this.variables[varName].value);
            });
            
            // Handle simple concatenation
            result = result.replace(/" plus "/g, '');
            result = result.replace(/"/g, '');
            
            // Handle plus operations
            if (result.includes(' plus ')) {
                const parts = result.split(' plus ');
                return parts.map(part => {
                    const trimmed = part.trim();
                    return this.variables[trimmed] ? this.variables[trimmed].value : trimmed;
                }).join('');
            }
            
            return result;
        }
        
        // Handle variable references
        if (this.variables[expr]) {
            return this.variables[expr].value;
        }
        
        return expr;
    }
    
    evaluateCondition(condition) {
        // Simple condition evaluation
        const gtMatch = condition.match(/(\w+) is greater than (\d+)/);
        if (gtMatch) {
            const [, varName, value] = gtMatch;
            const varValue = this.variables[varName] ? this.variables[varName].value : 0;
            return varValue > parseInt(value);
        }
        
        const ltMatch = condition.match(/(\w+) is less than (\d+)/);
        if (ltMatch) {
            const [, varName, value] = ltMatch;
            const varValue = this.variables[varName] ? this.variables[varName].value : 0;
            return varValue < parseInt(value);
        }
        
        const eqMatch = condition.match(/(\w+) equals "(.+)"/);
        if (eqMatch) {
            const [, varName, value] = eqMatch;
            const varValue = this.variables[varName] ? this.variables[varName].value : '';
            return varValue === value;
        }
        
        return false;
    }
}

// Make available globally
window.SimpleFlowScriptLexer = SimpleFlowScriptLexer;
window.SimpleFlowScriptInterpreter = SimpleFlowScriptInterpreter;