import { Token, TokenType, KEYWORDS } from './token-types.js';

export class Lexer {
    constructor(input) {
        this.input = input;
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.current_char = this.input[this.position] || null;
    }
    
    // Move to next character
    advance() {
        if (this.current_char === '\n') {
            this.line++;
            this.column = 1;
        } else {
            this.column++;
        }
        
        this.position++;
        this.current_char = this.position < this.input.length ? this.input[this.position] : null;
    }
    
    // Peek at next character without advancing
    peek(offset = 1) {
        const peek_pos = this.position + offset;
        return peek_pos < this.input.length ? this.input[peek_pos] : null;
    }
    
    // Skip whitespace (except newlines)
    skipWhitespace() {
        while (this.current_char !== null && /[ \t\r]/.test(this.current_char)) {
            this.advance();
        }
    }
    
    // Read a number token
    readNumber() {
        let result = '';
        const startColumn = this.column;
        
        while (this.current_char !== null && /\d/.test(this.current_char)) {
            result += this.current_char;
            this.advance();
        }
        
        // Check for decimal point
        if (this.current_char === '.' && /\d/.test(this.peek())) {
            result += this.current_char;
            this.advance();
            
            while (this.current_char !== null && /\d/.test(this.current_char)) {
                result += this.current_char;
                this.advance();
            }
        }
        
        return new Token(TokenType.NUMBER, result, this.line, startColumn);
    }
    
    // Read a string token
    readString() {
        let result = '';
        const startColumn = this.column;
        
        // Skip opening quote
        this.advance();
        
        while (this.current_char !== null && this.current_char !== '"') {
            if (this.current_char === '\\') {
                this.advance();
                if (this.current_char !== null) {
                    // Handle escape sequences
                    switch (this.current_char) {
                        case 'n':
                            result += '\n';
                            break;
                        case 't':
                            result += '\t';
                            break;
                        case 'r':
                            result += '\r';
                            break;
                        case '\\':
                            result += '\\';
                            break;
                        case '"':
                            result += '"';
                            break;
                        default:
                            result += this.current_char;
                    }
                    this.advance();
                }
            } else {
                result += this.current_char;
                this.advance();
            }
        }
        
        if (this.current_char === '"') {
            this.advance(); // Skip closing quote
        } else {
            throw new Error(`Unterminated string at line ${this.line}, column ${startColumn}`);
        }
        
        return new Token(TokenType.STRING, result, this.line, startColumn);
    }
    
    // Read an identifier or keyword
    readIdentifier() {
        let result = '';
        const startColumn = this.column;
        
        while (this.current_char !== null && /[a-zA-Z0-9_]/.test(this.current_char)) {
            result += this.current_char;
            this.advance();
        }
        
        const lowerResult = result.toLowerCase();
        const tokenType = KEYWORDS[lowerResult] || TokenType.IDENTIFIER;
        
        return new Token(tokenType, result, this.line, startColumn);
    }
    
    // Skip comments
    skipComment() {
        while (this.current_char !== null && this.current_char !== '\n') {
            this.advance();
        }
    }
    
    // Get next token
    getNextToken() {
        while (this.current_char !== null) {
            const startColumn = this.column;
            
            // Skip whitespace
            if (/[ \t\r]/.test(this.current_char)) {
                this.skipWhitespace();
                continue;
            }
            
            // Handle newlines
            if (this.current_char === '\n') {
                const token = new Token(TokenType.NEWLINE, '\n', this.line, startColumn);
                this.advance();
                return token;
            }
            
            // Handle comments
            if (this.current_char === '#') {
                this.skipComment();
                continue;
            }
            
            // Handle numbers
            if (/\d/.test(this.current_char)) {
                return this.readNumber();
            }
            
            // Handle strings
            if (this.current_char === '"') {
                return this.readString();
            }
            
            // Handle identifiers and keywords
            if (/[a-zA-Z_]/.test(this.current_char)) {
                return this.readIdentifier();
            }
            
            // Handle punctuation
            if (this.current_char === ':') {
                const token = new Token(TokenType.COLON, ':', this.line, startColumn);
                this.advance();
                return token;
            }
            
            if (this.current_char === ',') {
                const token = new Token(TokenType.COMMA, ',', this.line, startColumn);
                this.advance();
                return token;
            }
            
            // Unknown character
            const unknownChar = this.current_char;
            this.advance();
            return new Token(TokenType.UNKNOWN, unknownChar, this.line, startColumn);
        }
        
        return new Token(TokenType.EOF, null, this.line, this.column);
    }
    
    // Tokenize entire input
    tokenize() {
        const tokens = [];
        let token = this.getNextToken();
        
        while (!token.is(TokenType.EOF)) {
            // Skip newlines for now (can be added back for statement separation)
            if (!token.is(TokenType.NEWLINE)) {
                tokens.push(token);
            }
            token = this.getNextToken();
        }
        
        tokens.push(token); // Add EOF token
        return tokens;
    }
    
    // Reset lexer to beginning
    reset() {
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.current_char = this.input[this.position] || null;
    }
    
    // Get current position info
    getPosition() {
        return {
            position: this.position,
            line: this.line,
            column: this.column
        };
    }
}