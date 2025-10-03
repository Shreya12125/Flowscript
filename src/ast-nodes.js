// Base AST Node class
export class ASTNode {
    constructor(type, line = 0, column = 0) {
        this.type = type;
        this.line = line;
        this.column = column;
    }
    
    toString() {
        return `${this.type}Node`;
    }
    
    // Accept visitor pattern (for later tree traversal)
    accept(visitor) {
        const methodName = `visit${this.type}`;
        if (typeof visitor[methodName] === 'function') {
            return visitor[methodName](this);
        }
        return visitor.visitGeneric(this);
    }
}

// Program node - root of the AST
export class ProgramNode extends ASTNode {
    constructor(statements = []) {
        super('Program');
        this.statements = statements;
    }
    
    addStatement(statement) {
        this.statements.push(statement);
    }
    
    toString() {
        return `Program(${this.statements.length} statements)`;
    }
}

// Variable declaration node
export class VariableDeclarationNode extends ASTNode {
    constructor(dataType, identifier, value, line = 0, column = 0) {
        super('VariableDeclaration', line, column);
        this.dataType = dataType;
        this.identifier = identifier;
        this.value = value;
    }
    
    toString() {
        return `VarDecl(${this.dataType} ${this.identifier} = ${this.value})`;
    }
}

// Output statement node
export class OutputNode extends ASTNode {
    constructor(outputType, expression, line = 0, column = 0) {
        super('Output', line, column);
        this.outputType = outputType; // 'say' or 'display'
        this.expression = expression;
    }
    
    toString() {
        return `Output(${this.outputType}: ${this.expression})`;
    }
}

// Conditional statement node
export class ConditionalNode extends ASTNode {
    constructor(condition, thenStatement, elseStatement = null, line = 0, column = 0) {
        super('Conditional', line, column);
        this.condition = condition;
        this.thenStatement = thenStatement;
        this.elseStatement = elseStatement;
    }
    
    toString() {
        return `If(${this.condition} then ${this.thenStatement}${this.elseStatement ? ` else ${this.elseStatement}` : ''})`;
    }
}

// Loop statement node
export class LoopNode extends ASTNode {
    constructor(count, body, line = 0, column = 0) {
        super('Loop', line, column);
        this.count = count;
        this.body = body;
    }
    
    toString() {
        return `Loop(${this.count} times: ${this.body})`;
    }
}

// Function definition node
export class FunctionDefinitionNode extends ASTNode {
    constructor(name, parameters, body, line = 0, column = 0) {
        super('FunctionDefinition', line, column);
        this.name = name;
        this.parameters = parameters; // Array of parameter names
        this.body = body;
    }
    
    toString() {
        return `FuncDef(${this.name}(${this.parameters.join(', ')}) { ${this.body} })`;
    }
}

// Function call node
export class FunctionCallNode extends ASTNode {
    constructor(name, arguments_, line = 0, column = 0) {
        super('FunctionCall', line, column);
        this.name = name;
        this.arguments = arguments_; // Array of argument expressions
    }
    
    toString() {
        return `FuncCall(${this.name}(${this.arguments.join(', ')}))`;
    }
}

// Binary expression node (arithmetic, comparison)
export class BinaryExpressionNode extends ASTNode {
    constructor(left, operator, right, line = 0, column = 0) {
        super('BinaryExpression', line, column);
        this.left = left;
        this.operator = operator;
        this.right = right;
    }
    
    toString() {
        return `BinaryExpr(${this.left} ${this.operator} ${this.right})`;
    }
}

// Literal value node
export class LiteralNode extends ASTNode {
    constructor(dataType, value, line = 0, column = 0) {
        super('Literal', line, column);
        this.dataType = dataType; // 'number', 'string', 'boolean'
        this.value = value;
    }
    
    toString() {
        return `Literal(${this.dataType}: ${this.value})`;
    }
}

// Identifier node
export class IdentifierNode extends ASTNode {
    constructor(name, line = 0, column = 0) {
        super('Identifier', line, column);
        this.name = name;
    }
    
    toString() {
        return `Identifier(${this.name})`;
    }
}

// Expression list node (for function arguments, etc.)
export class ExpressionListNode extends ASTNode {
    constructor(expressions = [], line = 0, column = 0) {
        super('ExpressionList', line, column);
        this.expressions = expressions;
    }
    
    addExpression(expression) {
        this.expressions.push(expression);
    }
    
    toString() {
        return `ExprList([${this.expressions.join(', ')}])`;
    }
}

// Utility functions for creating nodes
export function createLiteral(value, line = 0, column = 0) {
    let dataType;
    if (typeof value === 'number') {
        dataType = 'number';
    } else if (typeof value === 'string') {
        dataType = 'string';
    } else if (typeof value === 'boolean') {
        dataType = 'boolean';
    } else {
        dataType = 'unknown';
    }
    
    return new LiteralNode(dataType, value, line, column);
}

export function createIdentifier(name, line = 0, column = 0) {
    return new IdentifierNode(name, line, column);
}

export function createBinaryExpression(left, operator, right, line = 0, column = 0) {
    return new BinaryExpressionNode(left, operator, right, line, column);
}
// Add these new node types to your existing ast-nodes.js

export class IfElseNode extends ASTNode {
    constructor(condition, thenStatement, elseStatement = null, line = 0, column = 0) {
        super('IfElse', line, column);
        this.condition = condition;
        this.thenStatement = thenStatement;
        this.elseStatement = elseStatement;
    }
    
    toString() {
        const elseStr = this.elseStatement ? ` else ${this.elseStatement}` : '';
        return `IfElse(${this.condition} then ${this.thenStatement}${elseStr})`;
    }
}

export class WhileLoopNode extends ASTNode {
    constructor(condition, body, line = 0, column = 0) {
        super('WhileLoop', line, column);
        this.condition = condition;
        this.body = body;
    }
}

export class ForLoopNode extends ASTNode {
    constructor(variable, start, end, body, line = 0, column = 0) {
        super('ForLoop', line, column);
        this.variable = variable;
        this.start = start;
        this.end = end;
        this.body = body;
    }
}

export class BlockNode extends ASTNode {
    constructor(statements = [], line = 0, column = 0) {
        super('Block', line, column);
        this.statements = statements;
    }
}

export class AssignmentNode extends ASTNode {
    constructor(identifier, value, line = 0, column = 0) {
        super('Assignment', line, column);
        this.identifier = identifier;
        this.value = value;
    }
}