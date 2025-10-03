export class SyntaxTranslator {
    constructor() {
        this.translators = {
            python: new PythonTranslator(),
            java: new JavaTranslator(),
            javascript: new JavaScriptTranslator(),
            cpp: new CppTranslator()
        };
    }
    
    registerTranslator(languageKey, translatorInstance) {
        this.translators[languageKey] = translatorInstance;
    }
    
    translate(ast, targetLanguage, options = {}) {
        if (!this.translators[targetLanguage]) {
            throw new Error(`Unsupported target language: ${targetLanguage}`);
        }
        
        const translator = this.translators[targetLanguage];
        if (options.indentString) {
            translator.setIndentString(options.indentString);
        }
        const result = translator.translate(ast);
        // Reset translator state for cleanliness between calls
        translator.reset();
        return result;
    }
    
    getAllTranslations(ast, options = {}) {
        const translations = {};
        for (const [lang, translator] of Object.entries(this.translators)) {
            try {
                if (options.indentString) {
                    translator.setIndentString(options.indentString);
                }
                translations[lang] = translator.translate(ast);
                translator.reset();
            } catch (error) {
                translations[lang] = `// Error translating to ${lang}: ${error.message}`;
            }
        }
        return translations;
    }
}

class BaseTranslator {
    constructor() {
        this.indentLevel = 0;
        this.indentString = '    '; // 4 spaces
    }
    
    indent() {
        return this.indentString.repeat(this.indentLevel);
    }
    
    increaseIndent() {
        this.indentLevel++;
    }
    
    decreaseIndent() {
        this.indentLevel = Math.max(0, this.indentLevel - 1);
    }
    
    setIndentString(indentString) {
        // Accept any indent string (tabs or spaces); default remains 4 spaces
        this.indentString = indentString || this.indentString;
    }
    
    reset() {
        this.indentLevel = 0;
        this.indentString = this.indentString || '    ';
    }
    
    translateExpression(expr) {
        if (!expr) return this.getNullValue();
        
        switch (expr.type) {
            case 'Literal':
                return this.translateLiteral(expr);
            case 'Identifier':
                return expr.name;
            case 'BinaryExpression':
                return this.translateBinaryExpression(expr);
            case 'FunctionCall':
                return this.translateFunctionCallExpression(expr);
            default:
                return this.getNullValue();
        }
    }
    
    translateLiteral(literal) {
        if (typeof literal.value === 'string') {
            return `"${literal.value.replace(/"/g, '\\"')}"`;
        }
        return literal.value.toString();
    }
    
    translateBinaryExpression(expr) {
        const left = this.translateExpression(expr.left);
        const right = this.translateExpression(expr.right);
        const op = this.translateOperator(expr.operator);
        
        return `${left} ${op} ${right}`;
    }
    
    translateOperator(operator) {
        const ops = {
            'plus': '+',
            'minus': '-',
            'times': '*',
            'divided by': '/',
            'is greater than': '>',
            'is less than': '<',
            'is greater than or equal to': '>=',
            'is less than or equal to': '<=',
            'equals': '==',
            'is': '==',
            'is not': '!=',
            'and': '&&',
            'or': '||'
        };
        return ops[operator] || operator;
    }
}

class PythonTranslator extends BaseTranslator {
    translate(ast) {
        let code = '# Translated from FlowScript to Python\n\n';
        this.indentLevel = 0;
        
        if (ast.statements) {
            for (const statement of ast.statements) {
                const translated = this.translateStatement(statement);
                if (translated) {
                    code += translated + '\n';
                }
            }
        }
        
        return code;
    }
    
    translateStatement(statement) {
        const indent = this.indent();
        
        switch (statement.type) {
            case 'VariableDeclaration':
                return `${indent}${statement.identifier} = ${this.translateExpression(statement.value)}`;
                
            case 'Assignment':
                return `${indent}${statement.identifier} = ${this.translateExpression(statement.value)}`;
                
            case 'Output':
                if (statement.outputType === 'say' || statement.outputType === 'display') {
                    return `${indent}print(${this.translateExpression(statement.expression)})`;
                }
                return `${indent}print(${this.translateExpression(statement.expression)})`;
                
            case 'Conditional':
            case 'IfElse':
                return this.translateConditional(statement);
                
            case 'Loop':
                return this.translateLoop(statement);
                
            case 'WhileLoop':
                return this.translateWhileLoop(statement);
                
            case 'ForLoop':
                return this.translateForLoop(statement);
                
            case 'FunctionDefinition':
                return this.translateFunctionDefinition(statement);
                
            case 'FunctionCall':
                return `${indent}${this.translateFunctionCallExpression(statement)}`;
                
            case 'Block':
                return this.translateBlock(statement);
                
            default:
                return `${indent}# Unknown statement: ${statement.type}`;
        }
    }
    
    translateConditional(statement) {
        const indent = this.indent();
        let code = `${indent}if ${this.translateExpression(statement.condition)}:`;
        
        this.increaseIndent();
        const thenCode = this.translateStatement(statement.thenStatement);
        code += '\n' + (thenCode || `${this.indent()}pass`);
        this.decreaseIndent();
        
        if (statement.elseStatement) {
            code += `\n${indent}else:`;
            this.increaseIndent();
            const elseCode = this.translateStatement(statement.elseStatement);
            code += '\n' + (elseCode || `${this.indent()}pass`);
            this.decreaseIndent();
        }
        
        return code;
    }
    
    translateLoop(statement) {
        const indent = this.indent();
        let code = `${indent}for _ in range(${this.translateExpression(statement.count)}):`;
        
        this.increaseIndent();
        const bodyCode = this.translateStatement(statement.body);
        code += '\n' + (bodyCode || `${this.indent()}pass`);
        this.decreaseIndent();
        
        return code;
    }
    
    translateWhileLoop(statement) {
        const indent = this.indent();
        let code = `${indent}while ${this.translateExpression(statement.condition)}:`;
        
        this.increaseIndent();
        const bodyCode = this.translateStatement(statement.body);
        code += '\n' + (bodyCode || `${this.indent()}pass`);
        this.decreaseIndent();
        
        return code;
    }
    
    translateForLoop(statement) {
        const indent = this.indent();
        const start = this.translateExpression(statement.start);
        const end = this.translateExpression(statement.end);
        let code = `${indent}for ${statement.variable} in range(${start}, ${end} + 1):`;
        
        this.increaseIndent();
        const bodyCode = this.translateStatement(statement.body);
        code += '\n' + (bodyCode || `${this.indent()}pass`);
        this.decreaseIndent();
        
        return code;
    }
    
    translateFunctionDefinition(statement) {
        const indent = this.indent();
        const params = statement.parameters.join(', ');
        let code = `${indent}def ${statement.name}(${params}):`;
        
        this.increaseIndent();
        const bodyCode = this.translateStatement(statement.body);
        code += '\n' + (bodyCode || `${this.indent()}pass`);
        this.decreaseIndent();
        
        return code;
    }
    
    translateFunctionCallExpression(statement) {
        const args = statement.arguments.map(arg => this.translateExpression(arg)).join(', ');
        return `${statement.name}(${args})`;
    }
    
    translateBlock(statement) {
        let code = '';
        for (const stmt of statement.statements) {
            const translated = this.translateStatement(stmt);
            if (translated) {
                code += (code ? '\n' : '') + translated;
            }
        }
        return code;
    }
    
    translateOperator(operator) {
        const ops = {
            'plus': '+',
            'minus': '-',
            'times': '*',
            'divided by': '/',
            'is greater than': '>',
            'is less than': '<',
            'is greater than or equal to': '>=',
            'is less than or equal to': '<=',
            'equals': '==',
            'is': '==',
            'is not': '!=',
            'and': 'and',
            'or': 'or'
        };
        return ops[operator] || operator;
    }
    
    getNullValue() {
        return 'None';
    }
}

class JavaTranslator extends BaseTranslator {
    translate(ast) {
        let code = '// Translated from FlowScript to Java\n';
        code += 'public class FlowScriptProgram {\n';
        code += '    public static void main(String[] args) {\n';
        
        this.indentLevel = 2; // Start with 2 levels of indentation
        
        if (ast.statements) {
            for (const statement of ast.statements) {
                const translated = this.translateStatement(statement);
                if (translated) {
                    code += translated + '\n';
                }
            }
        }
        
        code += '    }\n}\n';
        return code;
    }
    
    translateStatement(statement) {
        const indent = this.indent();
        
        switch (statement.type) {
            case 'VariableDeclaration':
                const javaType = this.getJavaType(statement.dataType);
                return `${indent}${javaType} ${statement.identifier} = ${this.translateExpression(statement.value)};`;
                
            case 'Assignment':
                return `${indent}${statement.identifier} = ${this.translateExpression(statement.value)};`;
                
            case 'Output':
                return `${indent}System.out.println(${this.translateExpression(statement.expression)});`;
                
            case 'Conditional':
            case 'IfElse':
                return this.translateConditional(statement);
                
            case 'Loop':
                return this.translateLoop(statement);
                
            case 'WhileLoop':
                return this.translateWhileLoop(statement);
                
            case 'ForLoop':
                return this.translateForLoop(statement);
                
            case 'FunctionDefinition':
                return this.translateFunctionDefinition(statement);
                
            case 'FunctionCall':
                return `${indent}${this.translateFunctionCallExpression(statement)};`;
                
            case 'Block':
                return this.translateBlock(statement);
                
            default:
                return `${indent}// Unknown statement: ${statement.type}`;
        }
    }
    
    translateConditional(statement) {
        const indent = this.indent();
        let code = `${indent}if (${this.translateExpression(statement.condition)}) {`;
        
        this.increaseIndent();
        const thenCode = this.translateStatement(statement.thenStatement);
        code += '\n' + (thenCode || `${this.indent()}// empty`);
        this.decreaseIndent();
        code += `\n${indent}}`;
        
        if (statement.elseStatement) {
            code += ` else {`;
            this.increaseIndent();
            const elseCode = this.translateStatement(statement.elseStatement);
            code += '\n' + (elseCode || `${this.indent()}// empty`);
            this.decreaseIndent();
            code += `\n${indent}}`;
        }
        
        return code;
    }
    
    translateLoop(statement) {
        const indent = this.indent();
        let code = `${indent}for (int i = 0; i < ${this.translateExpression(statement.count)}; i++) {`;
        
        this.increaseIndent();
        const bodyCode = this.translateStatement(statement.body);
        code += '\n' + (bodyCode || `${this.indent()}// empty`);
        this.decreaseIndent();
        code += `\n${indent}}`;
        
        return code;
    }
    
    translateWhileLoop(statement) {
        const indent = this.indent();
        let code = `${indent}while (${this.translateExpression(statement.condition)}) {`;
        
        this.increaseIndent();
        const bodyCode = this.translateStatement(statement.body);
        code += '\n' + (bodyCode || `${this.indent()}// empty`);
        this.decreaseIndent();
        code += `\n${indent}}`;
        
        return code;
    }
    
    translateForLoop(statement) {
        const indent = this.indent();
        const start = this.translateExpression(statement.start);
        const end = this.translateExpression(statement.end);
        let code = `${indent}for (int ${statement.variable} = ${start}; ${statement.variable} <= ${end}; ${statement.variable}++) {`;
        
        this.increaseIndent();
        const bodyCode = this.translateStatement(statement.body);
        code += '\n' + (bodyCode || `${this.indent()}// empty`);
        this.decreaseIndent();
        code += `\n${indent}}`;
        
        return code;
    }
    
    getJavaType(flowScriptType) {
        switch (flowScriptType) {
            case 'number': return 'double';
            case 'text': return 'String';
            case 'boolean': return 'boolean';
            default: return 'Object';
        }
    }
    
    getNullValue() {
        return 'null';
    }
}

class JavaScriptTranslator extends BaseTranslator {
    translate(ast) {
        let code = '// Translated from FlowScript to JavaScript\n\n';
        this.indentLevel = 0;
        
        if (ast.statements) {
            for (const statement of ast.statements) {
                const translated = this.translateStatement(statement);
                if (translated) {
                    code += translated + '\n';
                }
            }
        }
        
        return code;
    }
    
    translateStatement(statement) {
        const indent = this.indent();
        
        switch (statement.type) {
            case 'VariableDeclaration':
                return `${indent}let ${statement.identifier} = ${this.translateExpression(statement.value)};`;
                
            case 'Assignment':
                return `${indent}${statement.identifier} = ${this.translateExpression(statement.value)};`;
                
            case 'Output':
                return `${indent}console.log(${this.translateExpression(statement.expression)});`;
                
            case 'Conditional':
            case 'IfElse':
                return this.translateConditional(statement);
                
            case 'Loop':
                return this.translateLoop(statement);
                
            case 'WhileLoop':
                return this.translateWhileLoop(statement);
                
            case 'ForLoop':
                return this.translateForLoop(statement);
                
            case 'FunctionDefinition':
                return this.translateFunctionDefinition(statement);
                
            case 'FunctionCall':
                return `${indent}${this.translateFunctionCallExpression(statement)};`;
                
            case 'Block':
                return this.translateBlock(statement);
                
            default:
                return `${indent}// Unknown statement: ${statement.type}`;
        }
    }
    
    translateConditional(statement) {
        const indent = this.indent();
        let code = `${indent}if (${this.translateExpression(statement.condition)}) {`;
        
        this.increaseIndent();
        const thenCode = this.translateStatement(statement.thenStatement);
        code += '\n' + (thenCode || `${this.indent()}// empty`);
        this.decreaseIndent();
        code += `\n${indent}}`;
        
        if (statement.elseStatement) {
            code += ` else {`;
            this.increaseIndent();
            const elseCode = this.translateStatement(statement.elseStatement);
            code += '\n' + (elseCode || `${this.indent()}// empty`);
            this.decreaseIndent();
            code += `\n${indent}}`;
        }
        
        return code;
    }
    
    translateLoop(statement) {
        const indent = this.indent();
        let code = `${indent}for (let i = 0; i < ${this.translateExpression(statement.count)}; i++) {`;
        
        this.increaseIndent();
        const bodyCode = this.translateStatement(statement.body);
        code += '\n' + (bodyCode || `${this.indent()}// empty`);
        this.decreaseIndent();
        code += `\n${indent}}`;
        
        return code;
    }
    
    translateWhileLoop(statement) {
        const indent = this.indent();
        let code = `${indent}while (${this.translateExpression(statement.condition)}) {`;
        
        this.increaseIndent();
        const bodyCode = this.translateStatement(statement.body);
        code += '\n' + (bodyCode || `${this.indent()}// empty`);
        this.decreaseIndent();
        code += `\n${indent}}`;
        
        return code;
    }
    
    translateForLoop(statement) {
        const indent = this.indent();
        const start = this.translateExpression(statement.start);
        const end = this.translateExpression(statement.end);
        let code = `${indent}for (let ${statement.variable} = ${start}; ${statement.variable} <= ${end}; ${statement.variable}++) {`;
        
        this.increaseIndent();
        const bodyCode = this.translateStatement(statement.body);
        code += '\n' + (bodyCode || `${this.indent()}// empty`);
        this.decreaseIndent();
        code += `\n${indent}}`;
        
        return code;
    }
    
    translateFunctionDefinition(statement) {
        const indent = this.indent();
        const params = statement.parameters.join(', ');
        let code = `${indent}function ${statement.name}(${params}) {`;
        
        this.increaseIndent();
        const bodyCode = this.translateStatement(statement.body);
        code += '\n' + (bodyCode || `${this.indent()}// empty`);
        this.decreaseIndent();
        code += `\n${indent}}`;
        
        return code;
    }
    
    getNullValue() {
        return 'null';
    }
}

class CppTranslator extends BaseTranslator {
    translate(ast) {
        let code = '// Translated from FlowScript to C++\n';
        code += '#include <iostream>\n';
        code += 'int main() {\n';
        this.indentLevel = 1;
        
        if (ast.statements) {
            for (const statement of ast.statements) {
                const translated = this.translateStatement(statement);
                if (translated) {
                    code += translated + '\n';
                }
            }
        }
        
        code += '    return 0;\n';
        code += '}\n';
        return code;
    }
    
    translateStatement(statement) {
        const indent = this.indent();
        switch (statement.type) {
            case 'VariableDeclaration': {
                const cppType = this.getCppType(statement.dataType);
                return `${indent}${cppType} ${statement.identifier} = ${this.translateExpression(statement.value)};`;
            }
            case 'Assignment':
                return `${indent}${statement.identifier} = ${this.translateExpression(statement.value)};`;
            case 'Output':
                return `${indent}std::cout << ${this.translateExpression(statement.expression)} << std::endl;`;
            case 'Conditional':
            case 'IfElse':
                return this.translateConditional(statement);
            case 'Loop':
                return this.translateLoop(statement);
            case 'WhileLoop':
                return this.translateWhileLoop(statement);
            case 'ForLoop':
                return this.translateForLoop(statement);
            case 'FunctionDefinition':
                return this.translateFunctionDefinition(statement);
            case 'FunctionCall':
                return `${indent}${this.translateFunctionCallExpression(statement)};`;
            case 'Block':
                return this.translateBlock(statement);
            default:
                return `${indent}// Unknown statement: ${statement.type}`;
        }
    }
    
    translateConditional(statement) {
        const indent = this.indent();
        let code = `${indent}if (${this.translateExpression(statement.condition)}) {`;
        this.increaseIndent();
        const thenCode = this.translateStatement(statement.thenStatement);
        code += '\n' + (thenCode || `${this.indent()}// empty`);
        this.decreaseIndent();
        code += `\n${indent}}`;
        if (statement.elseStatement) {
            code += ' else {';
            this.increaseIndent();
            const elseCode = this.translateStatement(statement.elseStatement);
            code += '\n' + (elseCode || `${this.indent()}// empty`);
            this.decreaseIndent();
            code += `\n${indent}}`;
        }
        return code;
    }
    
    translateLoop(statement) {
        const indent = this.indent();
        let code = `${indent}for (int i = 0; i < ${this.translateExpression(statement.count)}; i++) {`;
        this.increaseIndent();
        const bodyCode = this.translateStatement(statement.body);
        code += '\n' + (bodyCode || `${this.indent()}// empty`);
        this.decreaseIndent();
        code += `\n${indent}}`;
        return code;
    }
    
    translateWhileLoop(statement) {
        const indent = this.indent();
        let code = `${indent}while (${this.translateExpression(statement.condition)}) {`;
        this.increaseIndent();
        const bodyCode = this.translateStatement(statement.body);
        code += '\n' + (bodyCode || `${this.indent()}// empty`);
        this.decreaseIndent();
        code += `\n${indent}}`;
        return code;
    }
    
    translateForLoop(statement) {
        const indent = this.indent();
        const start = this.translateExpression(statement.start);
        const end = this.translateExpression(statement.end);
        let code = `${indent}for (int ${statement.variable} = ${start}; ${statement.variable} <= ${end}; ${statement.variable}++) {`;
        this.increaseIndent();
        const bodyCode = this.translateStatement(statement.body);
        code += '\n' + (bodyCode || `${this.indent()}// empty`);
        this.decreaseIndent();
        code += `\n${indent}}`;
        return code;
    }
    
    translateFunctionDefinition(statement) {
        // In main-only skeleton, emit as a simple comment block to avoid linkage complexity
        const indent = this.indent();
        let code = `${indent}// function ${statement.name} is not emitted in this minimal C++ translator`;
        return code;
    }
    
    translateFunctionCallExpression(statement) {
        const args = statement.arguments.map(arg => this.translateExpression(arg)).join(', ');
        return `${statement.name}(${args})`;
    }
    
    translateBlock(statement) {
        let code = '';
        for (const stmt of statement.statements) {
            const translated = this.translateStatement(stmt);
            if (translated) {
                code += (code ? '\n' : '') + translated;
            }
        }
        return code;
    }
    
    getCppType(flowScriptType) {
        switch (flowScriptType) {
            case 'number': return 'double';
            case 'text': return 'std::string';
            case 'boolean': return 'bool';
            default: return 'auto';
        }
    }
    
    getNullValue() {
        return '0';
    }
}