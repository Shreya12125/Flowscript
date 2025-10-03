// Symbol table for managing variables and functions
export class SymbolTable {
    constructor(parent = null) {
        this.symbols = new Map();
        this.parent = parent; // For nested scopes
    }
    
    // Define a new symbol
    define(name, value, type = 'unknown') {
        this.symbols.set(name, {
            name,
            value,
            type,
            defined: true
        });
    }
    
    // Get symbol value
    get(name) {
        if (this.symbols.has(name)) {
            return this.symbols.get(name);
        }
        
        // Check parent scope
        if (this.parent) {
            return this.parent.get(name);
        }
        
        throw new Error(`Undefined variable: ${name}`);
    }
    
    // Set symbol value (for assignment)
    set(name, value) {
        if (this.symbols.has(name)) {
            const symbol = this.symbols.get(name);
            symbol.value = value;
            return;
        }
        
        // Check parent scope
        if (this.parent) {
            try {
                this.parent.set(name, value);
                return;
            } catch (e) {
                // Fall through to error
            }
        }
        
        throw new Error(`Undefined variable: ${name}`);
    }
    
    // Check if symbol exists
    exists(name) {
        return this.symbols.has(name) || (this.parent && this.parent.exists(name));
    }
    
    // Create new nested scope
    createChild() {
        return new SymbolTable(this);
    }
    
    // Get all symbols (for debugging)
    getAllSymbols() {
        const result = new Map(this.symbols);
        if (this.parent) {
            const parentSymbols = this.parent.getAllSymbols();
            for (const [name, symbol] of parentSymbols) {
                if (!result.has(name)) {
                    result.set(name, symbol);
                }
            }
        }
        return result;
    }
    
    // Clear current scope
    clear() {
        this.symbols.clear();
    }
    
    toString() {
        const symbolList = Array.from(this.symbols.entries())
            .map(([name, symbol]) => `${name}: ${symbol.value} (${symbol.type})`)
            .join(', ');
        return `SymbolTable{${symbolList}}`;
    }
}