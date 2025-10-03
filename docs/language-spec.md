# FlowScript Language Specification

## Design Philosophy
FlowScript uses conversational English to express programming logic, making it accessible to beginners while maintaining computational precision.

## Core Programming Constructs

### 1. Variables
**Natural Language**: "Create a [type] called [name] with value [value]"
**Examples**:
- Create a number called age with value 25
- Create a text called name with value "John"
- Create a boolean called isStudent with value true

### 2. Output/Display
**Natural Language**: "Say [expression]" or "Display [expression]"
**Examples**:
- Say "Hello World"
- Display age
- Say "Your age is " plus age

### 3. Arithmetic Operations
**Natural Language**: Using natural operators
**Examples**:
- age plus 5
- price minus discount
- length times width
- total divided by count

### 4. Conditional Statements
**Natural Language**: "If [condition] then [action]"
**Examples**:
- If age is greater than 18 then say "Adult"
- If temperature is less than 32 then say "Freezing"
- If name equals "John" then display "Welcome John"

### 5. Loops
**Natural Language**: "Repeat [number] times: [action]"
**Examples**:
- Repeat 5 times: say "Hello"
- Repeat 10 times: display counter

### 6. Functions
**Natural Language**: "Define a function called [name] that takes [parameters] and [body]"
**Examples**:
- Define a function called greet that takes name and says "Hello " plus name
- Define a function called add that takes x and y and returns x plus y

## Data Types
- **number**: Integer or decimal values (25, 3.14)
- **text**: String values ("Hello", "John")
- **boolean**: true or false values