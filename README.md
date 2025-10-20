# FlowScript

An educational, human‑readable programming language and interpreter with a browser IDE and Node.js CLI. FlowScript turns plain English‑like statements into an Abstract Syntax Tree (AST) and executes them via an interpreter — great for teaching programming concepts and building quick automation flows.

## Highlights

- **English‑like syntax**: `Create a number called x with value 10`, `Say "Hello"`, `If x is greater than y then say ...`
- **Full pipeline**: `Source → Lexer → Parser → AST → Interpreter` (+ optional **flow diagram** generation)
- **Web IDE** (`/web`) with examples, syntax help, and instant output
- **CLI & REPL** for local development
- **Step‑by‑step interpreter** for debugging/teaching
- **Extensive docs & tests**

---

## Architecture

```
Source Code (.fs)
   ↓
Lexer (src/lexer.js)          → Token stream (src/token-types.js, src/keywords.js)
   ↓
Parser (src/parser.js)        → AST (src/ast-nodes.js)
   ↓
Interpreter (src/interpreter.js) / Step Interpreter (src/step-interpreter.js)
   ↓
Output / Variables / Functions
```

Optional components:
- **Grammar Validator** (`src/grammar-validator.js`) — preflight syntax checks
- **Flow Generator** (`src/flow-generator.js`) — derive visual flow/graph from AST
- **Syntax Translator** (`src/syntax-translator.js`) — helpers to normalize grammar variants
- **REPL** (`src/repl.js`) — interactive shell

---

## Project Structure

```
Flowscript/
├─ src/                       # Core compiler/runtime
│  ├─ keywords.js             # Language keywords (“create… called… with value…”)
│  ├─ token-types.js          # Token kinds (IDENTIFIER, NUMBER, IF, SAY, etc.)
│  ├─ lexer.js                # Turns source text into tokens
│  ├─ parser.js               # Builds AST from tokens
│  ├─ ast-nodes.js            # AST node classes
│  ├─ symbol-table.js         # Scope, variables, functions
│  ├─ interpreter.js          # Executes AST (runtime)
│  ├─ step-interpreter.js     # Step‑through execution
│  ├─ grammar-validator.js    # Validates plain‑English statements
│  ├─ flow-generator.js       # Converts AST → flow representation
│  ├─ syntax-translator.js    # Normalizes/rewrites grammar variants
│  ├─ repl.js                 # CLI REPL
│  └─ interpreter-test.js     # Small runner for local testing
├─ web/                       # Browser IDE
│  ├─ index.html              # Editor, examples, output panel, docs
│  ├─ app.js                  # UI glue + interpreter integration
│  ├─ flowscript-advanced.js  # Parser/interpreter inlined for web
│  ├─ style.css               # UI styles
│  └─ help.html               # Extra help
├─ examples/                  # FlowScript sample programs
│  ├─ sample1.fs
│  ├─ sample2.fs
│  └─ test-programs.fs
├─ docs/                      # Specs & deep docs
│  ├─ PROJECT_OVERVIEW.md
│  ├─ grammar.md
│  └─ language-spec.md
├─ tests/                     # Node tests
│  ├─ grammar-tests.js
│  ├─ test-day1.js
│  ├─ test-day2.js
│  └─ test-day3.js
├─ package.json
├─ LICENSE
└─ README.md
```

---

## Language Overview

### Declarations
```fs
Create a number called age with value 25
Create a text called name with value "Alice"
Create a boolean called isStudent with value true
```

### Output
```fs
Say "Hello " plus name
Display "Your age is " plus age
```

### Comparisons & Logic
```fs
If age is greater than 18 then say "Adult"
If isStudent equals true then say "Student"
If x >= 5 and x <= 15 then say "In range"
```

### Arithmetic
```fs
Create a number called x with value 10
Create a number called y with value 3
Create a number called sum with value x plus y
Create a number called product with value x times y
Create a number called quotient with value x divided by y
Create a number called difference with value x minus y
```

### Loops
```fs
Create a number called counter with value 1
while counter < 5:
    say counter
    increase counter by 1
```

### Functions
```fs
Define function greet with parameter name:
    say "Hello " plus name

Call greet with "Alice"
```

> See **`docs/language-spec.md`** and **`docs/grammar.md`** for the full syntax and EBNF‑style grammar.

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

---

## Install & Build

```bash
# Install dependencies
npm install

# (Optional) build step if you bundle for the web
# npm run build
```

---

## Run in the Browser (Web IDE)

Open `web/index.html` in a local server (recommended) or directly in your browser.

```bash
# Quick local server (Node)
npx http-server web -p 8080

# or Python 3
python -m http.server 8080 -d web
```

Then visit **http://localhost:8080**. Paste an example from `examples/` and click **Run**.

---

## Run from CLI

### 1) Execute a file
```bash
node src/interpreter-test.js examples/sample1.fs
```

### 2) REPL
```bash
node src/repl.js
```

---

## Tests

```bash
npm test
# or run individual files
node tests/grammar-tests.js
node tests/test-day1.js
node tests/test-day2.js
node tests/test-day3.js
```

---

## Extending the Language

1. **Add keywords** in `src/keywords.js` and update `src/token-types.js`.
2. **Teach the lexer** new token patterns in `src/lexer.js`.
3. **Expand the parser** (`src/parser.js`) with new productions and AST nodes.
4. **Add node classes** to `src/ast-nodes.js`.
5. **Implement runtime behavior** in `src/interpreter.js` (and `src/step-interpreter.js`).
6. **Update web bundle** (`web/flowscript-advanced.js`) if exposing in the browser.

---

## Documentation

- `docs/PROJECT_OVERVIEW.md` — end‑to‑end design and data flow
- `docs/grammar.md` — grammar rules (EBNF‑style)
- `docs/language-spec.md` — language features and examples

---

## License

This project is licensed under the terms in `LICENSE`.
