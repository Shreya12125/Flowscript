import { Lexer } from './lexer.js';
import { TokenType, Token } from './token-types.js';
import { 
    ProgramNode, 
    VariableDeclarationNode, 
    OutputNode, 
    ConditionalNode, 
    LoopNode, 
    FunctionDefinitionNode,
    FunctionCallNode,
    BinaryExpressionNode,
    LiteralNode,
    IdentifierNode
} from './ast-nodes.js';

export class Parser {
    constructor(input) {
        this.lexer = new Lexer(input);
        this.tokens = this.lexer.tokenize();
        this.current_token_index = 0;
        this.current_token = this.tokens[0] || new Token(TokenType.EOF, null);
        this.errors = [];
    }

    eat(type) {
        if (this.current_token.type === type) {
            this.current_token = this.tokens[++this.current_token_index] || new Token(TokenType.EOF, null);
        } else {
            this.errors.push(`Expected ${type}, found ${this.current_token.type}`);
        }
    }

    parse() {
        const statements = [];
        while (this.current_token.type !== TokenType.EOF) {
            const stmt = this.parseStatement();
            if (stmt) statements.push(stmt);
        }
        return new ProgramNode(statements);
    }

    parseStatement() {
        switch (this.current_token.type) {
            case TokenType.LET:
                return this.parseVariableDeclaration();
            case TokenType.PRINT:
                return this.parseOutput();
            case TokenType.IF:
                return this.parseIfElse();
            case TokenType.WHILE:
                return this.parseWhile();
            case TokenType.FUNCTION:
                return this.parseFunctionDefinition();
            default:
                return this.parseExpression();
        }
    }

    parseVariableDeclaration() {
        this.eat(TokenType.LET);
        const name = this.current_token.value;
        this.eat(TokenType.IDENTIFIER);
        this.eat(TokenType.EQUALS);
        const value = this.parseExpression();
        return new VariableDeclarationNode(name, value);
    }

    parseOutput() {
        this.eat(TokenType.PRINT);
        const expr = this.parseExpression();
        return new OutputNode(expr);
    }

    parseIfElse() {
        this.eat(TokenType.IF);
        const condition = this.parseExpression();
        this.eat(TokenType.LBRACE);
        const thenBranch = [];
        while (this.current_token.type !== TokenType.RBRACE) {
            thenBranch.push(this.parseStatement());
        }
        this.eat(TokenType.RBRACE);

        let elseBranch = [];
        if (this.current_token.type === TokenType.ELSE) {
            this.eat(TokenType.ELSE);
            this.eat(TokenType.LBRACE);
            while (this.current_token.type !== TokenType.RBRACE) {
                elseBranch.push(this.parseStatement());
            }
            this.eat(TokenType.RBRACE);
        }

        return new ConditionalNode(condition, thenBranch, elseBranch);
    }

    parseWhile() {
        this.eat(TokenType.WHILE);
        const condition = this.parseExpression();
        this.eat(TokenType.LBRACE);
        const body = [];
        while (this.current_token.type !== TokenType.RBRACE) {
            body.push(this.parseStatement());
        }
        this.eat(TokenType.RBRACE);
        return new LoopNode(condition, body);
    }

    parseFunctionDefinition() {
        this.eat(TokenType.FUNCTION);
        const name = this.current_token.value;
        this.eat(TokenType.IDENTIFIER);
        this.eat(TokenType.LPAREN);
        const params = [];
        if (this.current_token.type !== TokenType.RPAREN) {
            params.push(this.current_token.value);
            this.eat(TokenType.IDENTIFIER);
            while (this.current_token.type === TokenType.COMMA) {
                this.eat(TokenType.COMMA);
                params.push(this.current_token.value);
                this.eat(TokenType.IDENTIFIER);
            }
        }
        this.eat(TokenType.RPAREN);
        this.eat(TokenType.LBRACE);
        const body = [];
        while (this.current_token.type !== TokenType.RBRACE) {
            body.push(this.parseStatement());
        }
        this.eat(TokenType.RBRACE);
        return new FunctionDefinitionNode(name, params, body);
    }

    parseExpression() {
        return this.parseBinaryExpression();
    }

    parseBinaryExpression() {
        let left = this.parsePrimary();
        while ([TokenType.PLUS, TokenType.MINUS, TokenType.STAR, TokenType.SLASH, TokenType.LESS, TokenType.GREATER, TokenType.EQUAL_EQUAL].includes(this.current_token.type)) {
            const operator = this.current_token.type;
            this.eat(operator);
            const right = this.parsePrimary();
            left = new BinaryExpressionNode(left, operator, right);
        }
        return left;
    }

    parsePrimary() {
        if (this.current_token.type === TokenType.NUMBER) {
            const value = this.current_token.value;
            this.eat(TokenType.NUMBER);
            return new LiteralNode(value);
        }
        if (this.current_token.type === TokenType.STRING) {
            const value = this.current_token.value;
            this.eat(TokenType.STRING);
            return new LiteralNode(value);
        }
        if (this.current_token.type === TokenType.IDENTIFIER) {
            const name = this.current_token.value;
            this.eat(TokenType.IDENTIFIER);
            if (this.current_token.type === TokenType.LPAREN) {
                this.eat(TokenType.LPAREN);
                const args = [];
                if (this.current_token.type !== TokenType.RPAREN) {
                    args.push(this.parseExpression());
                    while (this.current_token.type === TokenType.COMMA) {
                        this.eat(TokenType.COMMA);
                        args.push(this.parseExpression());
                    }
                }
                this.eat(TokenType.RPAREN);
                return new FunctionCallNode(name, args);
            }
            return new IdentifierNode(name);
        }
        return null;
    }
}
