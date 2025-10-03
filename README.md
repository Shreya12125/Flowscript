FlowScript
===========

FlowScript is a learning-oriented language and toolkit for translating human-friendly logic into executable behavior and real programming languages. It includes an interpreter, code translators (Python, Java, JavaScript, C++), a step-by-step execution engine, a flowchart generator, and a browser-based playground.

Contents
--------
- Overview
- Features
- Quick Start
- Usage
  - Run examples
  - REPL
  - Translate to other languages
  - Web playground
- Project Structure
- Examples
- Contributing
- Roadmap (What to improve next)

Overview
--------
FlowScript lets learners write logic in readable English-like statements and see the result in multiple target languages. It is designed to teach core programming concepts such as variables, conditionals, loops, functions, and flow of control, while offering visualizations and explainable translations.

Features
--------
- Lexer, Parser, and AST building for FlowScript
- Interpreter for executing FlowScript programs
- Step interpreter for line-by-line execution with traceable steps
- Code translation from AST to Python, Java, JavaScript, and C++
- Configurable indentation per translation (spaces or tabs)
- Flowchart generation from AST
- Lesson scaffolding and tests
- Web playground for interactive learning

Quick Start
----------
Prerequisites: Node.js (LTS recommended)

Install dependencies:

```bash
npm install
```

Run Node-based tests/demos (if scripts exist in `package.json`):

```bash
npm test
```

Usage
-----
Run examples
~~~~~~~~~~~~
There are sample FlowScript programs under `examples/`. You can execute them by importing the parser and interpreter in a small Node script, or use the REPL below.

REPL
~~~~
An interactive console is available to run FlowScript statements and see output/state.

Example (from a Node script):

```js
import { Parser } from './src/parser.js';
import { Interpreter } from './src/interpreter.js';
import fs from 'node:fs';

const source = fs.readFileSync('./examples/sample1.fs', 'utf-8');
const parser = new Parser(source);
const ast = parser.parseProgram();

const interpreter = new Interpreter();
const result = interpreter.interpret(ast);
console.log(result.output);
```

Translate to other languages
~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Use the syntax translator to convert FlowScript AST to Python, Java, JavaScript, or C++.

```js
import { Parser } from './src/parser.js';
import { SyntaxTranslator } from './src/syntax-translator.js';

const parser = new Parser('say "Hello"');
const ast = parser.parseProgram();

const translator = new SyntaxTranslator();
// Choose target: 'python' | 'java' | 'javascript' | 'cpp'
const pythonCode = translator.translate(ast, 'python', { indentString: '    ' });
console.log(pythonCode);

// Get all translations at once
const all = translator.getAllTranslations(ast, { indentString: '    ' });
console.log(all.javascript);
```

Register custom translators at runtime:

```js
translator.registerTranslator('kotlin', new KotlinTranslator());
```
## Contributors
- [shruti-sivakumar](https://github.com/shruti-sivakumar)  
- [Vida181105](https://github.com/Vida181105)

Web playground
~~~~~~~~~~~~~~
Open `web/index.html` (or `web/enhanced-index.html`) in a browser to try FlowScript in the UI. The app bundles interpreters and translators for an interactive experience.

Project Structure
-----------------
- `src/` core language and tooling
  - `lexer.js`, `parser.js`, `ast-nodes.js`, `token-types.js`
  - `interpreter.js`, `step-interpreter.js`
  - `syntax-translator.js` (Python, Java, JavaScript, C++)
  - `flow-generator.js` (flowcharts)
  - `lesson-system.js`, tests
- `web/` browser playground and assets
- `docs/` language spec and grammar notes
- `examples/` sample FlowScript programs

Examples
--------
See `examples/` for runnable FlowScript snippets (variables, say/display, conditionals, loops, functions). Try translating the same program into different languages to compare idioms.

Contributing
------------
Contributions are welcome. Please keep code readable and learner-friendly. Prefer clear names over abbreviations and ensure new features include examples.

Roadmap (What to improve next)
------------------------------
1) Learning UX
   - Side-by-side views: FlowScript, AST, flowchart, translated code
   - Synchronized highlighting: select a line → highlight corresponding AST and translated code
   - Step-through execution UI with variable watch and call stack

2) Explanations and guidance
   - Inline rationale: show which translation rule mapped a FlowScript statement to a target-language snippet
   - Tiered hints and solution reveal for exercises
   - Rich error messages with caret highlights and quick suggestions

3) Curriculum and challenges
   - Progressive lessons (variables → conditionals → loops → functions → arrays)
   - Auto-graded challenges: predict the output, fix the bug, fill in the blank
   - Save/share solutions and teacher packs

4) Translators and targets
   - Add more targets (C#, Kotlin, Swift)
   - Improve idiomatic output (e.g., Pythonic ranges, Java streams when appropriate)
   - Configurable formatting presets (tabs/spaces, brace style) per language

5) Visualization
   - Live flowchart execution highlighting
   - Data-flow visualizer for variable values over time

6) Platform polish
   - CLI tool for translate/run/visualize commands
   - Web bundling improvements and offline-friendly demo
   - Plugin API for custom translators and lesson modules

7) Testing and quality
   - Expand grammar tests and golden files for translations
   - Add sample projects and CI checks

License
-------
MIT


