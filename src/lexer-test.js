import { Lexer } from './lexer.js';
import { TokenType } from './token-types.js';

// Test the lexer with various FlowScript statements
export function testLexer() {
    console.log("=== FlowScript Lexer Tests ===\n");
    
    const testCases = [
        {
            name: "Variable Declaration",
            input: 'Create a number called age with value 25',
            expected: [
                TokenType.CREATE, TokenType.A, TokenType.TYPE_NUMBER, 
                TokenType.CALLED, TokenType.IDENTIFIER, TokenType.WITH, 
                TokenType.VALUE, TokenType.NUMBER
            ]
        },
        {
            name: "String Variable",
            input: 'Create a text called name with value "John Doe"',
            expected: [
                TokenType.CREATE, TokenType.A, TokenType.TYPE_TEXT,
                TokenType.CALLED, TokenType.IDENTIFIER, TokenType.WITH,
                TokenType.VALUE, TokenType.STRING
            ]
        },
        {
            name: "Output Statement",
            input: 'Say "Hello World"',
            expected: [TokenType.SAY, TokenType.STRING]
        },
        {
            name: "Arithmetic Expression",
            input: 'age plus 5',
            expected: [TokenType.IDENTIFIER, TokenType.PLUS, TokenType.NUMBER]
        },
        {
            name: "Conditional Statement",
            input: 'If age is greater than 18 then say "Adult"',
            expected: [
                TokenType.IF, TokenType.IDENTIFIER, TokenType.IS, 
                TokenType.GREATER, TokenType.THAN, TokenType.NUMBER,
                TokenType.THEN, TokenType.SAY, TokenType.STRING
            ]
        },
        {
            name: "Loop Statement",
            input: 'Repeat 5 times: say "Hello"',
            expected: [
                TokenType.REPEAT, TokenType.NUMBER, TokenType.TIMES,
                TokenType.COLON, TokenType.SAY, TokenType.STRING
            ]
        }
    ];
    
    let passed = 0;
    let failed = 0;
    
    testCases.forEach(testCase => {
        console.log(`--- Test: ${testCase.name} ---`);
        console.log(`Input: "${testCase.input}"`);
        
        const lexer = new Lexer(testCase.input);
        const tokens = lexer.tokenize();
        
        // Remove EOF token for comparison
        const actualTokens = tokens.slice(0, -1);
        
        console.log("Tokens:");
        actualTokens.forEach((token, index) => {
            const expected = testCase.expected[index] || 'MISSING';
            const status = token.type === expected ? '✅' : '❌';
            console.log(`  ${index + 1}. ${token.toString()} ${status}`);
        });
        
        // Check if token types match expected
        const typesMatch = actualTokens.length === testCase.expected.length &&
            actualTokens.every((token, index) => token.type === testCase.expected[index]);
        
        if (typesMatch) {
            console.log("Result: ✅ PASS\n");
            passed++;
        } else {
            console.log("Result: ❌ FAIL");
            console.log(`Expected: ${testCase.expected.join(', ')}`);
            console.log(`Actual: ${actualTokens.map(t => t.type).join(', ')}\n`);
            failed++;
        }
    });
    
    console.log(`=== Test Summary ===`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${passed + failed}\n`);
    
    return { passed, failed };
}

// Test specific tokenization features
export function testLexerFeatures() {
    console.log("=== Lexer Feature Tests ===\n");
    
    // Test 1: Comments
    console.log("1. Comment Handling:");
    const lexer1 = new Lexer('# This is a comment\nSay "Hello"');
    const tokens1 = lexer1.tokenize();
    console.log("Tokens:", tokens1.map(t => t.toString()));
    // Fixed: Check for non-null values and filter out comments properly
    const hasCommentTokens = tokens1.some(t => t.value !== null && typeof t.value === 'string' && t.value.includes('#'));
    console.log("Comments properly ignored:", !hasCommentTokens ? "✅" : "❌");
    
    // Test 2: String escapes
    console.log("\n2. String Escapes:");
    const lexer2 = new Lexer('Say "Hello\\nWorld"');
    const tokens2 = lexer2.tokenize();
    const stringToken = tokens2.find(t => t.type === TokenType.STRING);
    console.log("String token:", stringToken.toString());
    console.log("Escape sequence handled:", stringToken.value.includes('\n') ? "✅" : "❌");
    
    // Test 3: Numbers (integers and floats)
    console.log("\n3. Number Types:");
    const lexer3 = new Lexer('123 45.67');
    const tokens3 = lexer3.tokenize();
    const numberTokens = tokens3.filter(t => t.type === TokenType.NUMBER);
    console.log("Number tokens:", numberTokens.map(t => t.toString()));
    console.log("Integer and float parsed:", numberTokens.length === 2 ? "✅" : "❌");
    
    // Test 4: Position tracking
    console.log("\n4. Position Tracking:");
    const lexer4 = new Lexer('Say\n"Hello"\nDisplay age');
    const tokens4 = lexer4.tokenize();
    console.log("Tokens with positions:");
    tokens4.forEach(token => {
        if (!token.is(TokenType.EOF)) {
            console.log(`  ${token.toString()}`);
        }
    });
    console.log("Position tracking working:", tokens4.some(t => t.line > 1) ? "✅" : "❌");
    
    // Test 5: Error handling
    console.log("\n5. Error Handling:");
    try {
        const lexer5 = new Lexer('Say "unterminated string');
        const tokens5 = lexer5.tokenize();
        console.log("Unterminated string error handling: ❌ (Should have thrown error)");
    } catch (error) {
        console.log("Unterminated string error handling: ✅");
        console.log(`  Error caught: ${error.message}`);
    }
    
    // Test 6: Case insensitivity
    console.log("\n6. Case Insensitivity:");
    const lexer6 = new Lexer('CREATE A NUMBER called test with value 10');
    const tokens6 = lexer6.tokenize();
    const keywordTokens = tokens6.filter(t => [TokenType.CREATE, TokenType.A, TokenType.TYPE_NUMBER].includes(t.type));
    console.log("Keyword tokens:", keywordTokens.map(t => t.toString()));
    console.log("Case insensitivity working:", keywordTokens.length === 3 ? "✅" : "❌");
    
    // Test 7: Multi-line programs
    console.log("\n7. Multi-line Programs:");
    const multiLineProgram = `Create a number called x with value 5
Say "X is " plus x
If x is greater than 3 then say "Big"`;
    
    const lexer7 = new Lexer(multiLineProgram);
    const tokens7 = lexer7.tokenize();
    const nonEofTokens = tokens7.filter(t => !t.is(TokenType.EOF));
    console.log(`Multi-line tokens parsed: ${nonEofTokens.length}`);
    console.log("Multi-line parsing working:", nonEofTokens.length > 10 ? "✅" : "❌");
}

// Run all tests
if (import.meta.url === `file://${process.argv[1]}`) {
    testLexer();
    testLexerFeatures();
}