import { SymbolTable } from './symbol-table.js';

export class Interpreter {
    constructor() {
        this.globalScope = new SymbolTable();
        this.currentScope = this.globalScope;
        this.output = [];
        this.functions = new Map();
    }
    
    // Main interpretation method
    interpret(program) {
        this.output = [];
        
        try {
            for (const statement of program.statements) {
                this.executeStatement(statement);
            }
        } catch (error) {
            throw new Error(`Runtime Error: ${error.message}`);
        }
        
        return {
            output: this.output,
            variables: this.currentScope.getAllSymbols()
        };
    }
    
    // Execute a statement
    executeStatement(statement) {
        switch (statement.type) {
            case 'VariableDeclaration':
                return this.executeVariableDeclaration(statement);
            case 'Output':
                return this.executeOutput(statement);
            case 'Conditional':
                return this.executeConditional(statement);
            case 'Loop':
                return this.executeLoop(statement);
            case 'FunctionDefinition':
                return this.executeFunctionDefinition(statement);
            case 'FunctionCall':
                return this.executeFunctionCall(statement);
            default:
                throw new Error(`Unknown statement type: ${statement.type}`);
        }
    }
    
    // Execute variable declaration
    executeVariableDeclaration(statement) {
        const value = this.evaluateExpression(statement.value);
        
        // Type checking
        if (!this.checkType(value, statement.dataType)) {
            throw new Error(`Type mismatch: Cannot assign ${typeof value} to ${statement.dataType}`);
        }
        
        this.currentScope.define(statement.identifier, value, statement.dataType);
        return value;
    }
    
    // Execute output statement
    executeOutput(statement) {
        const value = this.evaluateExpression(statement.expression);
        const output = this.valueToString(value);
        this.output.push(output);
        console.log(output); // Also print to console
        return output;
    }
    
    // Execute conditional statement
    executeConditional(statement) {
        const conditionValue = this.evaluateExpression(statement.condition);
        
        if (this.isTruthy(conditionValue)) {
            return this.executeStatement(statement.thenStatement);
        } else if (statement.elseStatement) {
            return this.executeStatement(statement.elseStatement);
        }
        
        return null;
    }
    
    // Execute loop statement
    executeLoop(statement) {
        const count = this.evaluateExpression(statement.count);
        
        if (typeof count !== 'number' || count < 0) {
            throw new Error(`Loop count must be a non-negative number, got: ${count}`);
        }
        
        const results = [];
        for (let i = 0; i < count; i++) {
            results.push(this.executeStatement(statement.body));
        }
        
        return results;
    }
    
    // Execute function definition
    executeFunctionDefinition(statement) {
        this.functions.set(statement.name, statement);
        return statement.name;
    }
    
    // Execute function call
    executeFunctionCall(statement) {
        if (!this.functions.has(statement.name)) {
            throw new Error(`Unknown function: ${statement.name}`);
        }
        
        const functionDef = this.functions.get(statement.name);
        
        // Check parameter count
        if (statement.arguments.length !== functionDef.parameters.length) {
            throw new Error(`Function ${statement.name} expects ${functionDef.parameters.length} arguments, got ${statement.arguments.length}`);
        }
        
        // Create new scope for function
        const functionScope = this.currentScope.createChild();
        const previousScope = this.currentScope;
        this.currentScope = functionScope;
        
        try {
            // Bind arguments to parameters
            for (let i = 0; i < functionDef.parameters.length; i++) {
                const argValue = this.evaluateExpression(statement.arguments[i]);
                functionScope.define(functionDef.parameters[i], argValue);
            }
            
            // Execute function body
            const result = this.executeStatement(functionDef.body);
            return result;
        } finally {
            // Restore previous scope
            this.currentScope = previousScope;
        }
    }
    
    // Evaluate expressions
    evaluateExpression(expression) {
        switch (expression.type) {
            case 'Literal':
                return expression.value;
            case 'Identifier':
                return this.currentScope.get(expression.name).value;
            case 'BinaryExpression':
                return this.evaluateBinaryExpression(expression);
            default:
                throw new Error(`Unknown expression type: ${expression.type}`);
        }
    }
    
    // Evaluate binary expressions
    evaluateBinaryExpression(expression) {
        const left = this.evaluateExpression(expression.left);
        const right = this.evaluateExpression(expression.right);
        
        switch (expression.operator) {
            case 'plus':
                return left + right;
            case 'minus':
                return left - right;
            case 'times':
                return left * right;
            case 'divided by':
                if (right === 0) throw new Error("Division by zero");
                return left / right;
            case 'is greater than':
                return left > right;
            case 'is less than':
                return left < right;
            case 'equals':
            case 'is':
                return left === right;
            default:
                throw new Error(`Unknown operator: ${expression.operator}`);
        }
    }
    
    // Helper methods
    checkType(value, expectedType) {
        switch (expectedType) {
            case 'number':
                return typeof value === 'number';
            case 'text':
                return typeof value === 'string';
            case 'boolean':
                return typeof value === 'boolean';
            default:
                return true;
        }
    }
    
    isTruthy(value) {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0;
        if (typeof value === 'string') return value.length > 0;
        return false;
    }
    
    valueToString(value) {
        if (typeof value === 'string') return value;
        return String(value);
    }
    
    // Get current output
    getOutput() {
        return this.output;
    }
    
    // Clear output
    clearOutput() {
        this.output = [];
    }
    
    // Reset interpreter
    reset() {
        this.globalScope.clear();
        this.currentScope = this.globalScope;
        this.output = [];
        this.functions.clear();
    }
}