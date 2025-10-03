// Token type definitions for FlowScript
export const TokenType = {
    // Literals
    NUMBER: 'NUMBER',
    STRING: 'STRING',
    BOOLEAN: 'BOOLEAN',
    IDENTIFIER: 'IDENTIFIER',
    
    // Keywords
    CREATE: 'CREATE',
    CALLED: 'CALLED',
    WITH: 'WITH',
    VALUE: 'VALUE',
    
    // Data Types
    TYPE_NUMBER: 'TYPE_NUMBER',
    TYPE_TEXT: 'TYPE_TEXT',
    TYPE_BOOLEAN: 'TYPE_BOOLEAN',
    
    // Articles
    A: 'A',
    AN: 'AN',
    THE: 'THE',
    
    // Output Keywords
    SAY: 'SAY',
    DISPLAY: 'DISPLAY',
    
    // Arithmetic Operators
    PLUS: 'PLUS',
    MINUS: 'MINUS',
    TIMES: 'TIMES',
    DIVIDED: 'DIVIDED',
    BY: 'BY',
    
    // Comparison Operators
    IS: 'IS',
    EQUALS: 'EQUALS',
    GREATER: 'GREATER',
    LESS: 'LESS',
    THAN: 'THAN',
    
    // Control Flow
    IF: 'IF',
    THEN: 'THEN',
    ELSE: 'ELSE',
    
    // Loops
    REPEAT: 'REPEAT',
    TIMES: 'TIMES',
    
    // Functions
    DEFINE: 'DEFINE',
    FUNCTION: 'FUNCTION',
    THAT: 'THAT',
    TAKES: 'TAKES',
    AND: 'AND',
    RETURNS: 'RETURNS',
    
    // Punctuation
    COLON: 'COLON',
    COMMA: 'COMMA',
    
    // Special
    NEWLINE: 'NEWLINE',
    EOF: 'EOF',
    UNKNOWN: 'UNKNOWN'
};

// Token class
export class Token {
    constructor(type, value, line = 0, column = 0) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.column = column;
    }
    
    toString() {
        return `Token(${this.type}, "${this.value}", ${this.line}:${this.column})`;
    }
    
    // Check if token is of specific type
    is(type) {
        return this.type === type;
    }
    
    // Check if token is one of multiple types
    isOneOf(...types) {
        return types.includes(this.type);
    }
}

// Keyword mapping - EXPORTED
export const KEYWORDS = {
    'create': TokenType.CREATE,
    'a': TokenType.A,
    'an': TokenType.AN,
    'the': TokenType.THE,
    'called': TokenType.CALLED,
    'with': TokenType.WITH,
    'value': TokenType.VALUE,
    
    // Data types
    'number': TokenType.TYPE_NUMBER,
    'text': TokenType.TYPE_TEXT,
    'boolean': TokenType.TYPE_BOOLEAN,
    
    // Output
    'say': TokenType.SAY,
    'display': TokenType.DISPLAY,
    
    // Operators
    'plus': TokenType.PLUS,
    'minus': TokenType.MINUS,
    'times': TokenType.TIMES,
    'divided': TokenType.DIVIDED,
    'by': TokenType.BY,
    
    // Comparisons
    'is': TokenType.IS,
    'equals': TokenType.EQUALS,
    'greater': TokenType.GREATER,
    'less': TokenType.LESS,
    'than': TokenType.THAN,
    
    // Boolean values
    'true': TokenType.BOOLEAN,
    'false': TokenType.BOOLEAN,
    
    // Control flow
    'if': TokenType.IF,
    'then': TokenType.THEN,
    'else': TokenType.ELSE,
    
    // Loops
    'repeat': TokenType.REPEAT,
    'times': TokenType.TIMES,
    
    // Functions
    'define': TokenType.DEFINE,
    'function': TokenType.FUNCTION,
    'that': TokenType.THAT,
    'takes': TokenType.TAKES,
    'and': TokenType.AND,
    'returns': TokenType.RETURNS
};