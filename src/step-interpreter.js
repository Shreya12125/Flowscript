export class StepInterpreter {
    constructor() {
        this.variables = {};
        this.output = [];
        this.executionSteps = [];
        this.currentStep = 0;
        this.isStepMode = false;
        this.breakpoints = new Set();
    }
    
    enableStepMode() {
        this.isStepMode = true;
        this.executionSteps = [];
        this.currentStep = 0;
    }
    
    addStep(type, description, lineNumber, beforeState, afterState) {
        this.executionSteps.push({
            stepNumber: this.executionSteps.length + 1,
            type,
            description,
            lineNumber,
            beforeState: JSON.parse(JSON.stringify(beforeState)),
            afterState: JSON.parse(JSON.stringify(afterState)),
            timestamp: Date.now()
        });
    }
    
    executeWithSteps(code) {
        this.enableStepMode();
        this.variables = {};
        this.output = [];
        
        const lines = code.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const beforeState = {
                variables: JSON.parse(JSON.stringify(this.variables)),
                output: [...this.output]
            };
            
            this.executeLineWithStep(line, i + 1);
            
            const afterState = {
                variables: JSON.parse(JSON.stringify(this.variables)),
                output: [...this.output]
            };
            
            // Record the step
            this.addStep(
                this.getStatementType(line),
                `Executed: ${line}`,
                i + 1,
                beforeState,
                afterState
            );
        }
        
        return {
            output: this.output,
            variables: this.variables,
            steps: this.executionSteps
        };
    }
    
    executeLineWithStep(line, lineNumber) {
        const lower = line.toLowerCase();
        
        // Variable declaration
        const varMatch = lower.match(/create a (number|text|boolean) called (\w+) with value (.+)/);
        if (varMatch) {
            const [, type, name, value] = varMatch;
            const parsedValue = this.parseValue(value, type);
            this.variables[name] = { type, value: parsedValue };
            return;
        }
        
        // Say statements
        const sayMatch = lower.match(/say (.+)/);
        if (sayMatch) {
            const expression = sayMatch[1];
            const result = this.evaluateExpression(expression, line);
            this.output.push(result.toString());
            return;
        }
        
        // Display statements
        const displayMatch = lower.match(/display (\w+)/);
        if (displayMatch) {
            const varName = displayMatch[1];
            if (this.variables[varName]) {
                this.output.push(this.variables[varName].value.toString());
            }
            return;
        }
        
        // Conditionals
        const ifMatch = lower.match(/if (.+) then (.+)/);
        if (ifMatch) {
            const [, condition, action] = ifMatch;
            if (this.evaluateCondition(condition)) {
                this.executeLineWithStep(action, lineNumber);
            }
            return;
        }
        
        // Loops
        const loopMatch = lower.match(/repeat (\d+) times: (.+)/);
        if (loopMatch) {
            const [, count, action] = loopMatch;
            const num = parseInt(count);
            for (let i = 0; i < num; i++) {
                this.executeLineWithStep(action, lineNumber);
            }
            return;
        }
    }
    
    getStatementType(line) {
        const lower = line.toLowerCase();
        if (lower.startsWith('create')) return 'Variable Declaration';
        if (lower.startsWith('say') || lower.startsWith('display')) return 'Output';
        if (lower.startsWith('if')) return 'Conditional';
        if (lower.startsWith('repeat')) return 'Loop';
        return 'Unknown';
    }
    
    // ... (include other methods from original interpreter)
    parseValue(value, type) {
        const cleaned = value.trim().replace(/"/g, '');
        switch (type) {
            case 'number': return parseFloat(cleaned) || 0;
            case 'boolean': return cleaned === 'true';
            default: return cleaned;
        }
    }
    
    evaluateExpression(expr, originalLine) {
        if (expr.includes('"')) {
            let result = expr;
            Object.keys(this.variables).forEach(varName => {
                const regex = new RegExp(`\\b${varName}\\b`, 'g');
                result = result.replace(regex, this.variables[varName].value);
            });
            result = result.replace(/" plus "/g, '');
            result = result.replace(/"/g, '');
            
            if (result.includes(' plus ')) {
                const parts = result.split(' plus ');
                return parts.map(part => {
                    const trimmed = part.trim();
                    return this.variables[trimmed] ? this.variables[trimmed].value : trimmed;
                }).join('');
            }
            return result;
        }
        
        if (this.variables[expr]) {
            return this.variables[expr].value;
        }
        return expr;
    }
    
    evaluateCondition(condition) {
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