export class FlowchartGenerator {
    constructor() {
        this.nodes = [];
        this.connections = [];
        this.nodeId = 0;
    }
    
    generateFlowchart(ast) {
        this.nodes = [];
        this.connections = [];
        this.nodeId = 0;
        
        const startNode = this.createNode('start', 'Start', 'start');
        let currentNode = startNode;
        
        if (ast.statements) {
            for (const statement of ast.statements) {
                const nextNode = this.processStatement(statement);
                this.connect(currentNode.id, nextNode.id);
                currentNode = nextNode;
            }
        }
        
        const endNode = this.createNode('end', 'End', 'end');
        this.connect(currentNode.id, endNode.id);
        
        return {
            nodes: this.nodes,
            connections: this.connections
        };
    }
    
    processStatement(statement) {
        switch (statement.type) {
            case 'VariableDeclaration':
                return this.createNode(
                    'process',
                    `${statement.identifier} = ${this.getValueString(statement.value)}`,
                    'process'
                );
                
            case 'OutputStatement':
                return this.createNode(
                    'output',
                    `Output: ${this.getExpressionString(statement.expression)}`,
                    'output'
                );
                
            case 'ConditionalStatement':
                return this.processConditional(statement);
                
            case 'LoopStatement':
                return this.processLoop(statement);
                
            default:
                return this.createNode('process', statement.content || 'Unknown', 'process');
        }
    }
    
    processConditional(statement) {
        const conditionNode = this.createNode(
            'decision',
            this.getExpressionString(statement.condition),
            'decision'
        );
        
        const thenNode = this.processStatement(statement.thenStatement);
        this.connect(conditionNode.id, thenNode.id, 'Yes');
        
        if (statement.elseStatement) {
            const elseNode = this.processStatement(statement.elseStatement);
            this.connect(conditionNode.id, elseNode.id, 'No');
        }
        
        return conditionNode;
    }
    
    processLoop(statement) {
        const loopNode = this.createNode(
            'decision',
            `Repeat ${this.getExpressionString(statement.count)} times`,
            'decision'
        );
        
        const bodyNode = this.processStatement(statement.body);
        this.connect(loopNode.id, bodyNode.id, 'Continue');
        this.connect(bodyNode.id, loopNode.id); // Loop back
        
        return loopNode;
    }
    
    createNode(id, label, type) {
        const node = {
            id: `node_${this.nodeId++}`,
            label,
            type,
            x: 0,
            y: 0
        };
        this.nodes.push(node);
        return node;
    }
    
    connect(fromId, toId, label = '') {
        this.connections.push({
            from: fromId,
            to: toId,
            label
        });
    }
    
    getExpressionString(expr) {
        if (!expr) return '';
        if (expr.type === 'Literal') {
            return typeof expr.value === 'string' ? `"${expr.value}"` : expr.value.toString();
        }
        if (expr.type === 'Identifier') {
            return expr.name;
        }
        if (expr.type === 'BinaryExpression') {
            return `${this.getExpressionString(expr.left)} ${expr.operator} ${this.getExpressionString(expr.right)}`;
        }
        return expr.toString();
    }
    
    getValueString(value) {
        if (value && value.type === 'Literal') {
            return typeof value.value === 'string' ? `"${value.value}"` : value.value.toString();
        }
        return value ? value.toString() : '';
    }
    
    // Generate SVG representation
    generateSVG() {
        const width = 800;
        const height = 600;
        const nodeWidth = 120;
        const nodeHeight = 60;
        
        // Auto-layout nodes
        this.layoutNodes(width, height, nodeWidth, nodeHeight);
        
        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
        
        // Add styles
        svg += `<style>
            .flowchart-start { fill: #10b981; stroke: #059669; }
            .flowchart-end { fill: #ef4444; stroke: #dc2626; }
            .flowchart-process { fill: #3b82f6; stroke: #2563eb; }
            .flowchart-decision { fill: #f59e0b; stroke: #d97706; }
            .flowchart-output { fill: #8b5cf6; stroke: #7c3aed; }
            .flowchart-text { fill: white; font-family: Arial; font-size: 12px; text-anchor: middle; }
            .flowchart-connection { stroke: #374151; stroke-width: 2; fill: none; marker-end: url(#arrowhead); }
            .flowchart-label { fill: #374151; font-family: Arial; font-size: 10px; text-anchor: middle; }
        </style>`;
        
        // Add arrow marker
        svg += `<defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
            </marker>
        </defs>`;
        
        // Draw connections first
        for (const connection of this.connections) {
            const fromNode = this.nodes.find(n => n.id === connection.from);
            const toNode = this.nodes.find(n => n.id === connection.to);
            
            if (fromNode && toNode) {
                const startX = fromNode.x + nodeWidth / 2;
                const startY = fromNode.y + nodeHeight;
                const endX = toNode.x + nodeWidth / 2;
                const endY = toNode.y;
                
                svg += `<path d="M ${startX} ${startY} L ${endX} ${endY}" class="flowchart-connection" />`;
                
                if (connection.label) {
                    const midX = (startX + endX) / 2;
                    const midY = (startY + endY) / 2;
                    svg += `<text x="${midX}" y="${midY}" class="flowchart-label">${connection.label}</text>`;
                }
            }
        }
        
        // Draw nodes
        for (const node of this.nodes) {
            if (node.type === 'decision') {
                // Diamond shape for decisions
                const centerX = node.x + nodeWidth / 2;
                const centerY = node.y + nodeHeight / 2;
                const points = `${centerX},${node.y} ${node.x + nodeWidth},${centerY} ${centerX},${node.y + nodeHeight} ${node.x},${centerY}`;
                svg += `<polygon points="${points}" class="flowchart-${node.type}" />`;
            } else {
                // Rectangle for other types
                const rx = node.type === 'start' || node.type === 'end' ? 30 : 5;
                svg += `<rect x="${node.x}" y="${node.y}" width="${nodeWidth}" height="${nodeHeight}" rx="${rx}" class="flowchart-${node.type}" />`;
            }
            
            // Add text
            const textX = node.x + nodeWidth / 2;
            const textY = node.y + nodeHeight / 2 + 4;
            svg += `<text x="${textX}" y="${textY}" class="flowchart-text">${this.wrapText(node.label, 15)}</text>`;
        }
        
        svg += '</svg>';
        return svg;
    }
    
    layoutNodes(width, height, nodeWidth, nodeHeight) {
        const margin = 50;
        const verticalSpacing = 100;
        
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].x = (width - nodeWidth) / 2;
            this.nodes[i].y = margin + i * verticalSpacing;
        }
    }
    
    wrapText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
}