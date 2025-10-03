import { PATTERNS, matchPattern, extractComponents } from './patterns.js';
import { KEYWORDS } from './keywords.js';

export class GrammarValidator {
    constructor() {
        this.errors = [];
    }

    // Validate a complete FlowScript program
    validateProgram(program) {
        this.errors = [];
        const lines = program.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));
        
        let isValid = true;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (!this.validateStatement(line, i + 1)) {
                isValid = false;
            }
        }
        
        return {
            valid: isValid,
            errors: this.errors
        };
    }

    // Validate individual statement
    validateStatement(statement, lineNumber = 0) {
        // Keep original case for error messages, but use lowercase for pattern matching
        const original = statement.trim();
        const trimmed = original.toLowerCase();
        
        // Check each statement type
        if (this.isVariableDeclaration(trimmed)) {
            return this.validateVariableDeclaration(trimmed, lineNumber, original);
        } else if (this.isOutputStatement(trimmed)) {
            return this.validateOutputStatement(trimmed, lineNumber, original);
        } else if (this.isConditionalStatement(trimmed)) {
            return this.validateConditionalStatement(trimmed, lineNumber, original);
        } else if (this.isLoopStatement(trimmed)) {
            return this.validateLoopStatement(trimmed, lineNumber, original);
        } else if (this.isFunctionDefinition(trimmed)) {
            return this.validateFunctionDefinition(trimmed, lineNumber, original);
        } else {
            this.addError(`Unknown statement type at line ${lineNumber}: ${original}`);
            return false;
        }
    }

    // Statement type checkers
    isVariableDeclaration(statement) {
        return matchPattern(PATTERNS.VARIABLE_DECLARATION, statement) !== null;
    }

    isOutputStatement(statement) {
        return matchPattern(PATTERNS.SAY_STATEMENT, statement) !== null ||
               matchPattern(PATTERNS.DISPLAY_STATEMENT, statement) !== null;
    }

    isConditionalStatement(statement) {
        return matchPattern(PATTERNS.IF_STATEMENT, statement) !== null;
    }

    isLoopStatement(statement) {
        return matchPattern(PATTERNS.REPEAT_STATEMENT, statement) !== null;
    }

    isFunctionDefinition(statement) {
        return matchPattern(PATTERNS.FUNCTION_DEF, statement) !== null;
    }

    // Validation methods for each statement type
    validateVariableDeclaration(statement, lineNumber, original = statement) {
        const components = extractComponents(PATTERNS.VARIABLE_DECLARATION, statement);
        if (!components) {
            this.addError(`Invalid variable declaration syntax at line ${lineNumber}: ${original}`);
            return false;
        }

        const [type, name, value] = components.groups;
        
        // Validate type
        if (!['number', 'text', 'boolean'].includes(type.toLowerCase())) {
            this.addError(`Invalid data type '${type}' at line ${lineNumber}. Must be 'number', 'text', or 'boolean'.`);
            return false;
        }

        // Validate identifier
        if (!matchPattern(PATTERNS.IDENTIFIER, name)) {
            this.addError(`Invalid variable name '${name}' at line ${lineNumber}. Must start with a letter and contain only letters and numbers.`);
            return false;
        }

        // Validate value matches type
        if (!this.validateValueType(value.trim(), type.toLowerCase())) {
            this.addError(`Value '${value}' doesn't match type '${type}' at line ${lineNumber}`);
            return false;
        }

        return true;
    }

    validateOutputStatement(statement, lineNumber, original = statement) {
        // Check if it's a say statement
        const sayMatch = extractComponents(PATTERNS.SAY_STATEMENT, statement);
        const displayMatch = extractComponents(PATTERNS.DISPLAY_STATEMENT, statement);
        
        if (!sayMatch && !displayMatch) {
            this.addError(`Invalid output statement syntax at line ${lineNumber}: ${original}`);
            return false;
        }

        const expression = sayMatch ? sayMatch.groups[0] : displayMatch.groups[0];
        
        // Basic expression validation
        if (!expression || expression.trim().length === 0) {
            this.addError(`Empty expression in output statement at line ${lineNumber}`);
            return false;
        }

        return true;
    }

    validateConditionalStatement(statement, lineNumber, original = statement) {
        const components = extractComponents(PATTERNS.IF_STATEMENT, statement);
        if (!components) {
            this.addError(`Invalid conditional statement syntax at line ${lineNumber}: ${original}`);
            return false;
        }

        const [condition, action] = components.groups;
        
        // Validate condition is not empty
        if (!condition || condition.trim().length === 0) {
            this.addError(`Empty condition in if statement at line ${lineNumber}`);
            return false;
        }

        // Validate action is not empty
        if (!action || action.trim().length === 0) {
            this.addError(`Empty action in if statement at line ${lineNumber}`);
            return false;
        }

        // Basic condition pattern validation
        if (!matchPattern(PATTERNS.COMPARISON, condition)) {
            this.addError(`Invalid condition format at line ${lineNumber}. Expected format like 'age is greater than 18'`);
            return false;
        }

        return true;
    }

    validateLoopStatement(statement, lineNumber, original = statement) {
        const components = extractComponents(PATTERNS.REPEAT_STATEMENT, statement);
        if (!components) {
            this.addError(`Invalid loop statement syntax at line ${lineNumber}: ${original}`);
            return false;
        }

        const [count, action] = components.groups;
        
        // Validate count is a number
        if (!matchPattern(PATTERNS.NUMBER, count)) {
            this.addError(`Loop count must be a positive number at line ${lineNumber}, got '${count}'`);
            return false;
        }

        // Validate count is positive
        const countValue = parseInt(count);
        if (countValue <= 0) {
            this.addError(`Loop count must be greater than 0 at line ${lineNumber}, got ${countValue}`);
            return false;
        }

        // Validate action is not empty
        if (!action || action.trim().length === 0) {
            this.addError(`Empty action in repeat statement at line ${lineNumber}`);
            return false;
        }

        return true;
    }

    validateFunctionDefinition(statement, lineNumber, original = statement) {
        const components = extractComponents(PATTERNS.FUNCTION_DEF, statement);
        if (!components) {
            this.addError(`Invalid function definition syntax at line ${lineNumber}: ${original}`);
            return false;
        }

        const [functionName, parameters, body] = components.groups;
        
        // Validate function name
        if (!matchPattern(PATTERNS.IDENTIFIER, functionName)) {
            this.addError(`Invalid function name '${functionName}' at line ${lineNumber}. Must start with a letter and contain only letters and numbers.`);
            return false;
        }

        // Validate parameters (basic check)
        if (!parameters || parameters.trim().length === 0) {
            this.addError(`Function must have at least one parameter at line ${lineNumber}`);
            return false;
        }

        // Validate body is not empty
        if (!body || body.trim().length === 0) {
            this.addError(`Function body cannot be empty at line ${lineNumber}`);
            return false;
        }

        // Split and validate individual parameter names
        const paramList = parameters.split(/\s+and\s+/).map(p => p.trim());
        for (const param of paramList) {
            if (!matchPattern(PATTERNS.IDENTIFIER, param)) {
                this.addError(`Invalid parameter name '${param}' in function '${functionName}' at line ${lineNumber}`);
                return false;
            }
        }

        return true;
    }

    // Helper methods
    validateValueType(value, expectedType) {
        // Remove extra whitespace
        value = value.trim();
        
        switch (expectedType) {
            case 'number':
                return matchPattern(PATTERNS.NUMBER, value) !== null;
            case 'text':
                return matchPattern(PATTERNS.STRING, value) !== null;
            case 'boolean':
                return matchPattern(PATTERNS.BOOLEAN, value) !== null;
            default:
                return false;
        }
    }

    addError(message) {
        this.errors.push(message);
    }

    getErrors() {
        return this.errors;
    }

    clearErrors() {
        this.errors = [];
    }

    // Additional helper method for debugging
    getLastError() {
        return this.errors.length > 0 ? this.errors[this.errors.length - 1] : null;
    }

    // Method to check if a specific pattern matches (for debugging)
    testPattern(pattern, input) {
        const result = matchPattern(pattern, input.toLowerCase());
        return {
            matches: result !== null,
            groups: result ? result.slice(1) : null
        };
    }
}