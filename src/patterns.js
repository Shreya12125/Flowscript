// Natural Language Pattern Matching
export const PATTERNS = {
    // Variable Declaration Pattern
    VARIABLE_DECLARATION: /^create\s+a\s+(number|text|boolean)\s+called\s+(\w+)\s+with\s+value\s+(.+)$/i,
    
    // Output Patterns
    SAY_STATEMENT: /^say\s+(.+)$/i,
    DISPLAY_STATEMENT: /^display\s+(.+)$/i,
    
    // Conditional Pattern
    IF_STATEMENT: /^if\s+(.+)\s+then\s+(.+)$/i,
    
    // Loop Pattern
    REPEAT_STATEMENT: /^repeat\s+(\d+)\s+times:\s+(.+)$/i,
    
    // Function Definition Pattern
    FUNCTION_DEF: /^define\s+a\s+function\s+called\s+(\w+)\s+that\s+takes\s+(.+)\s+and\s+(.+)$/i,
    
    // Arithmetic Expression Patterns
    ARITHMETIC: /(\w+|\d+(?:\.\d+)?)\s+(plus|minus|times|divided\s+by)\s+(\w+|\d+(?:\.\d+)?)/i,
    
    // Comparison Expression Patterns
    COMPARISON: /(\w+|\d+(?:\.\d+)?)\s+(is\s+greater\s+than|is\s+less\s+than|equals|is)\s+(.+)/i,
    
    // Identifiers and Literals
    IDENTIFIER: /^[a-zA-Z][a-zA-Z0-9]*$/,
    NUMBER: /^\d+(?:\.\d+)?$/,
    STRING: /^"([^"]*)"$/,
    BOOLEAN: /^(true|false)$/i
};

// Helper function to test patterns
export function matchPattern(pattern, input) {
    const match = input.trim().match(pattern);
    return match ? match : null;
}

// Extract components from matched patterns
export function extractComponents(pattern, input) {
    const match = matchPattern(pattern, input);
    if (!match) return null;
    
    return {
        full: match[0],
        groups: match.slice(1)
    };
}