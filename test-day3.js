// Day 3 Integration Test
import { testInterpreter, testErrorHandling } from './src/interpreter-test.js';
import { Parser } from './src/parser.js';
import { Interpreter } from './src/interpreter.js';

console.log("=== FlowScript Day 3 Integration Test ===\n");

// Test interpreter
console.log("🚀 Running Interpreter Tests...");
const interpreterResults = testInterpreter();
testErrorHandling();

// Test complete program execution
console.log("🧪 Testing Complete Program Execution...");

const complexProgram = `
# FlowScript Complex Program Test
Create a text called greeting with value "Hello"
Create a text called name with value "FlowScript"
Create a number called version with value 1

Say greeting plus " " plus name plus " v" plus version

Create a number called x with value 10
Create a number called y with value 5

If x is greater than y then say "x is bigger"
If y is less than x then say "y is smaller"

Say "Math results:"
Say "Addition: " plus x plus y
Say "Multiplication: " plus x times y

Repeat 2 times: say "Counting..."
`;

try {
    console.log("--- Complex Program Test ---");
    console.log("Program:");
    complexProgram.split('\n').slice(1, -1).forEach((line, index) => {
        if (line.trim()) {
            console.log(`  ${index + 1}. ${line.trim()}`);
        }
    });
    
    const parser = new Parser(complexProgram);
    const ast = parser.parseProgram();
    
    console.log(`\nParsed ${ast.statements.length} statements.`);
    console.log("\nExecution Output:");
    
    const interpreter = new Interpreter();
    const result = interpreter.interpret(ast);
    
    console.log("\n✅ Complex program executed successfully!");
    
} catch (error) {
    console.log(`\n❌ Complex program failed: ${error.message}`);
}

// Summary
console.log("\n=== Day 3 Summary ===");
console.log(`Interpreter Tests: ${interpreterResults.passed}✅ ${interpreterResults.failed}❌`);

if (interpreterResults.failed === 0) {
    console.log("🎉 All tests passed! FlowScript interpreter is working!");
} else {
    console.log("⚠️  Some tests failed. Review implementation.");
}

console.log("\n=== Day 3 Complete! ===");
console.log("Tomorrow: Day 4 - Web Interface & Final Polish");