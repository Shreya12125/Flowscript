import { GrammarValidator } from '../src/grammar-validator.js';

// Test the grammar validator
function runGrammarTests() {
    const validator = new GrammarValidator();
    
    console.log("Running FlowScript Grammar Tests...\n");

    // Test 1: Valid variable declarations
    testValidStatements(validator, [
        'Create a number called age with value 25',
        'Create a text called name with value "John"',
        'Create a boolean called isStudent with value true'
    ], "Valid Variable Declarations");

    // Test 2: Valid output statements
    testValidStatements(validator, [
        'Say "Hello World"',
        'Display age',
        'Say "Your age is " plus age'
    ], "Valid Output Statements");

    // Test 3: Valid conditional statements
    testValidStatements(validator, [
        'If age is greater than 18 then say "Adult"',
        'If name equals "John" then display "Welcome"'
    ], "Valid Conditional Statements");

    // Test 4: Valid loop statements
    testValidStatements(validator, [
        'Repeat 5 times: say "Hello"',
        'Repeat 10 times: display counter'
    ], "Valid Loop Statements");

    // Test 5: Invalid statements
    testInvalidStatements(validator, [
        'Create a invalid called test with value 5',
        'If age then say something',
        'Repeat hello times: do nothing'
    ], "Invalid Statements");
}

function testValidStatements(validator, statements, testName) {
    console.log(`--- ${testName} ---`);
    statements.forEach((statement, index) => {
        const result = validator.validateStatement(statement);
        console.log(`${index + 1}. "${statement}" - ${result ? 'PASS' : 'FAIL'}`);
        if (!result) {
            console.log(`   Errors: ${validator.getErrors().join(', ')}`);
        }
        validator.errors = []; // Reset errors for next test
    });
    console.log();
}

function testInvalidStatements(validator, statements, testName) {
    console.log(`--- ${testName} ---`);
    statements.forEach((statement, index) => {
        const result = validator.validateStatement(statement);
        console.log(`${index + 1}. "${statement}" - ${!result ? 'PASS (correctly rejected)' : 'FAIL (should be rejected)'}`);
        if (!result) {
            console.log(`   Errors: ${validator.getErrors().join(', ')}`);
        }
        validator.errors = []; // Reset errors for next test
    });
    console.log();
}

// Run tests
runGrammarTests();