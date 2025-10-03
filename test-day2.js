// Day 2 Integration Test
import { testLexer, testLexerFeatures } from './src/lexer-test.js';
import { testParser, testASTStructure } from './src/parser-test.js';

console.log("=== FlowScript Day 2 Integration Test ===\n");

console.log("🔤 Running Lexer Tests...");
const lexerResults = testLexer();
testLexerFeatures();

console.log("🌳 Running Parser Tests...");
const parserResults = testParser();
testASTStructure();

// Summary
console.log("=== Day 2 Summary ===");
console.log(`Lexer Tests: ${lexerResults.passed}✅ ${lexerResults.failed}❌`);
console.log(`Parser Tests: ${parserResults.passed}✅ ${parserResults.failed}❌`);

if (lexerResults.failed === 0 && parserResults.failed === 0) {
    console.log("🎉 All tests passed! Ready for Day 3.");
} else {
    console.log("⚠️  Some tests failed. Review implementation before continuing.");
}

console.log("\n=== Day 2 Complete! ===");
console.log("Tomorrow: Day 3 - Complete Parser & AST Generation");