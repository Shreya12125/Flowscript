import { Parser } from './parser.js';
import { Interpreter } from './interpreter.js';

export function testInterpreter() {
    console.log("=== FlowScript Interpreter Tests ===\n");
    
    const testCases = [
        {
            name: "Variable Declaration and Output",
            program: `Create a number called age with value 25
Say age`,
            expectedOutput: ["25"]
        },
        {
            name: "String Variables",
            program: `Create a text called name with value "Alice"
Say "Hello " plus name`,
            expectedOutput: ["Hello Alice"]
        },
        {
            name: "Arithmetic Operations",
            program: `Create a number called x with value 10
Create a number called y with value 5
Say x plus y
Say x minus y
Say x times y
Say x divided by y`,
            expectedOutput: ["15", "5", "50", "2"]
        },
        {
            name: "Boolean Variables",
            program: `Create a boolean called isActive with value true
Say isActive`,
            expectedOutput: ["true"]
        },
        {
            name: "Conditional Statements",
            program: `Create a number called age with value 20
If age is greater than 18 then say "Adult"
Create a number called score with value 15
If score is less than 20 then say "Try again"`,
            expectedOutput: ["Adult", "Try again"]
        },
        {
            name: "Loop Statements",
            program: `Repeat 3 times: say "Hello"`,
            expectedOutput: ["Hello", "Hello", "Hello"]
        },
        {
            name: "Complex Expressions",
            program: `Create a number called a with value 5
Create a number called b with value 10
Say a plus b times 2`,
            expectedOutput: ["25"] // Should be 5 + (10 * 2) = 25
        }
    ];
    
    let passed = 0;
    let failed = 0;
    
    testCases.forEach(testCase => {
        console.log(`--- Test: ${testCase.name} ---`);
        console.log(`Program:`);
        testCase.program.split('\n').forEach((line, index) => {
            console.log(`  ${index + 1}. ${line}`);
        });
        
        try {
            const parser = new Parser(testCase.program);
            const ast = parser.parseProgram();
            
            const interpreter = new Interpreter();
            const result = interpreter.interpret(ast);
            
            console.log(`Expected Output: [${testCase.expectedOutput.join(', ')}]`);
            console.log(`Actual Output: [${result.output.join(', ')}]`);
            
            // Check if outputs match
            const outputsMatch = result.output.length === testCase.expectedOutput.length &&
                result.output.every((output, index) => output === testCase.expectedOutput[index]);
            
            if (outputsMatch) {
                console.log("Result: ✅ PASS\n");
                passed++;
            } else {
                console.log("Result: ❌ FAIL - Output mismatch\n");
                failed++;
            }
            
        } catch (error) {
            console.log(`Result: ❌ FAIL - Error: ${error.message}\n`);
            failed++;
        }
    });
    
    console.log(`=== Interpreter Test Summary ===`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${passed + failed}\n`);
    
    return { passed, failed };
}

// Test error handling
export function testErrorHandling() {
    console.log("=== Error Handling Tests ===\n");
    
    const errorTests = [
        {
            name: "Undefined Variable",
            program: "Say unknownVariable",
            expectError: true
        },
        {
            name: "Type Mismatch",
            program: 'Create a number called x with value "not a number"',
            expectError: false // Parser should handle this
        },
        {
            name: "Division by Zero",
            program: `Create a number called x with value 10
Create a number called y with value 0
Say x divided by y`,
            expectError: true
        }
    ];
    
    errorTests.forEach(test => {
        console.log(`--- ${test.name} ---`);
        console.log(`Program: ${test.program}`);
        
        try {
            const parser = new Parser(test.program);
            const ast = parser.parseProgram();
            const interpreter = new Interpreter();
            const result = interpreter.interpret(ast);
            
            if (test.expectError) {
                console.log("Result: ❌ FAIL - Expected error but none occurred\n");
            } else {
                console.log("Result: ✅ PASS - No error as expected\n");
            }
        } catch (error) {
            if (test.expectError) {
                console.log(`Result: ✅ PASS - Error caught: ${error.message}\n`);
            } else {
                console.log(`Result: ❌ FAIL - Unexpected error: ${error.message}\n`);
            }
        }
    });
}

// Run tests
if (import.meta.url === `file://${process.argv[1]}`) {
    testInterpreter();
    testErrorHandling();
}