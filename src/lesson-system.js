export class LessonSystem {
    constructor() {
        this.lessons = this.initializeLessons();
        this.currentLesson = null;
        this.progress = this.loadProgress();
    }
    
    initializeLessons() {
        return [
            {
                id: 1,
                title: "Variables and Basic Output",
                description: "Learn to create variables and display them",
                objectives: [
                    "Create number variables",
                    "Create text variables", 
                    "Use the Say command",
                    "Display variable values"
                ],
                content: `
# Lesson 1: Variables and Basic Output

In FlowScript, we create variables using natural language. Think of a variable as a labeled box that holds a value.

## Creating Variables

To create a variable, we use this pattern:
**Create a [type] called [name] with value [value]**

Examples:
- Create a number called age with value 25
- Create a text called name with value "Alice"
- Create a boolean called isActive with value true

## Displaying Information

To show information to the user:
- **Say "message"** - displays text exactly as written
- **Display variableName** - shows the value stored in a variable

Try it yourself!
                `,
                exercises: [
                    {
                        id: "1-1",
                        title: "Create Your First Variable",
                        description: "Create a number variable called 'score' with value 100",
                        starterCode: "# Create a number variable here\n",
                        solution: "Create a number called score with value 100",
                        hints: [
                            "Remember the pattern: Create a [type] called [name] with value [value]",
                            "The type should be 'number'",
                            "The name should be 'score'",
                            "The value should be 100"
                        ],
                        tests: [
                            {
                                description: "Creates a variable named 'score'",
                                check: (result) => result.variables && result.variables.score !== undefined
                            },
                            {
                                description: "Score has value 100",
                                check: (result) => result.variables.score && result.variables.score.value === 100
                            }
                        ]
                    },
                    {
                        id: "1-2", 
                        title: "Say Hello",
                        description: "Use the Say command to output 'Hello, FlowScript!'",
                        starterCode: "# Write a Say command here\n",
                        solution: 'Say "Hello, FlowScript!"',
                        hints: [
                            "Use the Say command",
                            "Put your message in quotes",
                            "The message should be exactly: Hello, FlowScript!"
                        ],
                        tests: [
                            {
                                description: "Produces output",
                                check: (result) => result.output && result.output.length > 0
                            },
                            {
                                description: "Output contains 'Hello, FlowScript!'",
                                check: (result) => result.output[0] === "Hello, FlowScript!"
                            }
                        ]
                    }
                ]
            },
            {
                id: 2,
                title: "Arithmetic and String Operations", 
                description: "Learn to perform calculations and combine text",
                objectives: [
                    "Use arithmetic operators",
                    "Combine text with plus",
                    "Mix variables and literals"
                ],
                content: `
# Lesson 2: Arithmetic and String Operations

## Arithmetic Operations
FlowScript supports natural language arithmetic:
- **plus** for addition
- **minus** for subtraction  
- **times** for multiplication
- **divided by** for division

Examples:
- Say age plus 5
- Say price minus discount
- Say length times width

## String Concatenation
Use **plus** to combine text:
- Say "Hello " plus name
- Say "Your score is " plus score

## Practice Time!
Try combining numbers and text in creative ways.
                `,
                exercises: [
                    {
                        id: "2-1",
                        title: "Simple Math",
                        description: "Create two numbers and display their sum",
                        starterCode: `Create a number called x with value 15
Create a number called y with value 25
# Display their sum here`,
                        solution: `Create a number called x with value 15
Create a number called y with value 25
Say x plus y`,
                        hints: [
                            "Use the plus operator between the variables",
                            "Say x plus y will display the sum"
                        ],
                        tests: [
                            {
                                description: "Creates variables x and y",
                                check: (result) => result.variables.x && result.variables.y
                            },
                            {
                                description: "Displays sum of 40", 
                                check: (result) => result.output[0] === "40"
                            }
                        ]
                    }
                ]
            },
            // Add more lessons...
        ];
    }
    
    getLesson(id) {
        return this.lessons.find(lesson => lesson.id === id);
    }
    
    getAllLessons() {
        return this.lessons;
    }
    
    startLesson(id) {
        this.currentLesson = this.getLesson(id);
        return this.currentLesson;
    }
    
    checkExercise(exerciseId, userCode, interpreter) {
        const lesson = this.currentLesson;
        if (!lesson) return null;
        
        const exercise = lesson.exercises.find(ex => ex.id === exerciseId);
        if (!exercise) return null;
        
        try {
            const result = interpreter.interpret(userCode);
            const testResults = [];
            let allPassed = true;
            
            for (const test of exercise.tests) {
                const passed = test.check(result);
                testResults.push({
                    description: test.description,
                    passed
                });
                if (!passed) allPassed = false;
            }
            
            if (allPassed) {
                this.markExerciseComplete(exerciseId);
            }
            
            return {
                passed: allPassed,
                tests: testResults,
                output: result.output,
                variables: result.variables
            };
        } catch (error) {
            return {
                passed: false,
                error: error.message,
                tests: []
            };
        }
    }
    
    markExerciseComplete(exerciseId) {
        if (!this.progress.completedExercises) {
            this.progress.completedExercises = [];
        }
        if (!this.progress.completedExercises.includes(exerciseId)) {
            this.progress.completedExercises.push(exerciseId);
            this.saveProgress();
        }
    }
    
    getProgress() {
        return this.progress;
    }
    
    saveProgress() {
        // In a real app, save to localStorage or server
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('flowscript_progress', JSON.stringify(this.progress));
        }
    }
    
    loadProgress() {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('flowscript_progress');
            return saved ? JSON.parse(saved) : { completedExercises: [] };
        }
        return { completedExercises: [] };
    }
}