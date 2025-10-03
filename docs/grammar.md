# FlowScript Formal Grammar (BNF)

## Complete Grammar Specification
```bnf
<program> ::= <statement_list>

<statement_list> ::= <statement> | <statement> <statement_list>

<statement> ::= <variable_declaration>
              | <output_statement>
              | <conditional_statement>
              | <loop_statement>
              | <function_definition>
              | <function_call>

<variable_declaration> ::= "create" "a" <type> "called" <identifier> "with" "value" <expression>

<output_statement> ::= "say" <expression>
                     | "display" <expression>

<conditional_statement> ::= "if" <condition> "then" <statement>
                          | "if" <condition> "then" <statement> "else" <statement>

<loop_statement> ::= "repeat" <number> "times" ":" <statement>

<function_definition> ::= "define" "a" "function" "called" <identifier> 
                         "that" "takes" <parameter_list> "and" <statement>

<function_call> ::= <identifier> <argument_list>

<expression> ::= <arithmetic_expression>
               | <string_expression>
               | <boolean_expression>
               | <identifier>
               | <literal>

<arithmetic_expression> ::= <term> <arithmetic_operator> <term>

<string_expression> ::= <string_term> "plus" <string_term>

<condition> ::= <expression> <comparison_operator> <expression>

<comparison_operator> ::= "is" "greater" "than"
                        | "is" "less" "than"
                        | "equals"
                        | "is"

<arithmetic_operator> ::= "plus"
                        | "minus"
                        | "times"
                        | "divided" "by"

<type> ::= "number" | "text" | "boolean"

<term> ::= <identifier> | <number> | <function_call>

<string_term> ::= <identifier> | <string> | <function_call>

<parameter_list> ::= <identifier>
                   | <identifier> "and" <parameter_list>

<argument_list> ::= <expression>
                  | <expression> <argument_list>

<literal> ::= <number> | <string> | <boolean>

<identifier> ::= <letter> <alphanumeric>*

<number> ::= <digit>+ | <digit>+ "." <digit>+

<string> ::= '"' <character>* '"'

<boolean> ::= "true" | "false"

<letter> ::= "a" | "b" | ... | "z" | "A" | "B" | ... | "Z"

<digit> ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"

<character> ::= any printable ASCII character except '"'

<alphanumeric> ::= <letter> | <digit>