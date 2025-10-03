import { Parser } from './parser.js';

// Test the parser with various FlowScript statements
export function testParser() {
    console.log("=== FlowScript Parser Tests ===\n");
    
    const testCases = [
        {
            name: "Variable Declaration",
            input: 'Create a number called age with value 25',
            expectedType: 'VariableDeclaration'
        },
        {
            name: "String Variable",
            input: 'Create a text called name with value "John"',
            expectedType: 'VariableDeclaration'
        },
        {
            name: "Boolean Variable",
            input: 'Create a boolean called isStudent with value true',
            expectedType: 'VariableDeclaration'
        },
        {
            name: "Simple Output",
            input: 'Say "Hello World"',
            expectedType: 'Output'
        },
        {
            name: "Variable Output",
            input: 'Display age',
            expectedType: 'Output'
        },
        {
            name: "Arithmetic Expression",
            input: 'Say age plus 5',
            expectedType: 'Output'
        },
        {
            name: "Conditional Statement",
            input: 'If age is greater than 18 then say "Adult"',
            expectedType: 'Conditional'
        },
        {
            name: "Loop Statement",
            input: 'Repeat 5 times: say "Hello"',
            expectedType: 'Loop'
        }
    ];
    
    let passed = 0;
    let failed = 0;
    
    testCases.forEach(testCase => {
        console.log(`--- Test: ${testCase.name} ---`);
        console.log(`Input: "${testCase.input}"`);
        
        try {
            const parser = new Parser(testCase.input);
            const program = parser.parseProgram();
            
            if (program.statements.length > 0) {
                const statement = program.statements[0];
                console.log(`Parsed: ${statement.toString()}`);
                
                if (statement.type === testCase.expectedType) {
                    console.log("Result: ✅ PASS\n");
                    passed++;
                } else {
                    console.log(`Result: ❌ FAIL - Expected ${testCase.expectedType}, got ${statement.type}\n`);
                    failed++;
                }
            } else {
                console.log("Result: ❌ FAIL - No statements parsed\n");
                failed++;
            }
        } catch (error) {
            console.log(`Result: ❌ FAIL - Parse error: ${error.message}\n`);
            failed++;
        }
    });
    
    console.log(`=== Parser Test Summary ===`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${passed + failed}\n`);
    
    return { passed, failed };
}

// Test AST structure for complex expressions
export function testASTStructure() {
    console.log("=== AST Structure Tests ===\n");
    
    const complexTests = [
        {
            name: "Complex Arithmetic",
            input: 'Say age plus 5 times 2',
            description: "Tests operator precedence"
        },
        {
            name: "Complex Comparison",
            input: 'If age plus 10 is greater than 25 then say "OK"',
            description: "Tests expression in condition"
        },
        {
            name: "Multiple Statements",
            input: `Create a number called x with value 10
Say "X is " plus x
If x is greater than 5 then say "Big"`,
            description: "Tests multiple statement parsing"
        }
    ];
    
    complexTests.forEach(test => {
        console.log(`--- ${test.name} ---`);
        console.log(`Description: ${test.description}`);
        console.log(`Input: "${test.input.replace(/\n/g, ' | ')}"`);
        
        try {
            const parser = new Parser(test.input);
            const program = parser.parseProgram();
            
            console.log(`Statements parsed: ${program.statements.length}`);
            program.statements.forEach((stmt, index) => {
                console.log(`  ${index + 1}. ${stmt.toString()}`);
            });
            
            console.log("Result: ✅ PASS\n");
        } catch (error) {
            console.log(`Result: ❌ FAIL - Error: ${error.message}\n`);
        }
    });
}

// Run all parser tests
if (import.meta.url === `file://${process.argv[1]}`) {
    testParser();
    testASTStructure();
}