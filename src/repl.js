import { Parser } from './parser.js';
import { Interpreter } from './interpreter.js';
import readline from 'readline';

export class FlowScriptREPL {
    constructor() {
        this.interpreter = new Interpreter();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    
    start() {
        console.log("=== FlowScript REPL ===");
        console.log("Type FlowScript commands. Type 'exit' to quit, 'clear' to reset, 'help' for examples.\n");
        
        this.prompt();
    }
    
    prompt() {
        this.rl.question('FlowScript> ', (input) => {
            this.handleInput(input.trim());
        });
    }
    
    handleInput(input) {
        if (!input) {
            this.prompt();
            return;
        }
        
        switch (input.toLowerCase()) {
            case 'exit':
            case 'quit':
                console.log("Goodbye!");
                this.rl.close();
                return;
                
            case 'clear':
                this.interpreter.reset();
                console.log("Interpreter reset.");
                this.prompt();
                return;
                
            case 'help':
                this.showHelp();
                this.prompt();
                return;
                
            case 'vars':
                this.showVariables();
                this.prompt();
                return;
        }
        
        try {
            const parser = new Parser(input);
            const ast = parser.parseProgram();
            
            if (ast.statements.length === 0) {
                console.log("No statements to execute.");
            } else {
                const result = this.interpreter.interpret(ast);
                // Output is already printed by interpreter
            }
        } catch (error) {
            console.log(`Error: ${error.message}`);
        }
        
        this.prompt();
    }
    
    showHelp() {
        console.log(`
FlowScript Examples:
  Create a number called age with value 25
  Create a text called name with value "Alice"
  Say "Hello " plus name
  If age is greater than 18 then say "Adult"
  Repeat 3 times: say "Hello"
  
Commands:
  help  - Show this help
  vars  - Show current variables
  clear - Reset interpreter
  exit  - Quit REPL
`);
    }
    
    showVariables() {
        const variables = this.interpreter.currentScope.getAllSymbols();
        if (variables.size === 0) {
            console.log("No variables defined.");
        } else {
            console.log("Current variables:");
            for (const [name, symbol] of variables) {
                console.log(`  ${name}: ${symbol.value} (${symbol.type})`);
            }
        }
    }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
    const repl = new FlowScriptREPL();
    repl.start();
}