"use strict";
// Vertex class representing vertices in graph
let Vertex = /** @class */ (() => {
    class Vertex {
        constructor(x, y, heuristic, color = 'blue') {
            this.adjList = [];
            this.visited = false;
            this.x = x;
            this.y = y;
            this.color = color;
            this.children = [];
            this.id = ++Vertex._id;
            this.heuristic = heuristic;
        }
        // Adds child to vertex
        appendChild(vertex) {
            vertex.adjList = [this, ...vertex.adjList];
            this.adjList = [...this.adjList, vertex];
            this.children = [...this.children, vertex];
        }
        // Marks vertex as visited for rendering
        visit(srcVertex) {
            this.visited = true;
            this.color = 'green';
            return new Promise((res) => setTimeout(() => {
                renderVertex(this);
                if (srcVertex) {
                    renderEdge(srcVertex, this, 'green');
                }
                res();
            }, 1000));
        }
    }
    Vertex._id = 0;
    return Vertex;
})();
// Class for Graph
class Graph {
    constructor(root) {
        this.root = root;
    }
    async bestFirstSearch(vertex, goal) {
        let open = [];
        let closed = [];
        open = vertex.children;
        closed.push(vertex);
        await vertex.visit();
        while (open.length > 0) {
            open.sort((a, b) => b.heuristic - a.heuristic);
            const current = open.pop();
            closed.push(current);
            open = [...open, ...current.children];
            await current?.visit();
            if (current && current.children.some((child) => child.id === goal.id)) {
                await goal.visit();
                closed.push(goal);
                return closed;
            }
        }
        return closed;
    }
    renderPath(path) {
        path.forEach((vertex, i) => {
            vertex.color = 'purple';
            renderVertex(vertex);
            if (path[i + 1]) {
                renderEdge(vertex, path[i + 1], 'purple');
            }
        });
    }
}
// Renders a Vertex to the screen
function renderVertex(vertex) {
    const canvas = document.getElementById('canvas');
    const ctx = canvas?.getContext('2d');
    if (!ctx) {
        return;
    }
    ctx.beginPath();
    ctx.strokeText(`${vertex.heuristic}`, vertex.x, vertex.y - 10);
    ctx.arc(vertex.x, vertex.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = vertex.color;
    ctx.fill();
}
// Renders an edge to the screen
function renderEdge(src, dest, color = 'black') {
    const canvas = document.getElementById('canvas');
    const ctx = canvas?.getContext('2d');
    if (!ctx) {
        return;
    }
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(src.x, src.y);
    ctx.lineTo(dest.x, dest.y);
    ctx.stroke();
}
// Renders the initial graph to the screen
function renderGraph(root) {
    renderVertex(root);
    if (root.children.length === 0) {
        renderVertex(root);
    }
    else {
        root.children.forEach((child) => {
            renderGraph(child);
            renderEdge(root, child);
        });
    }
}
function manhattanDistance(src, dest) {
    return Math.sqrt(Math.pow(src.x - dest.x, 2)) + Math.sqrt(Math.pow(src.y - dest.y, 2));
}
// Create the graph, append children, and render
const goalCoords = { x: 240, y: 300 };
const goal = new Vertex(goalCoords.x, goalCoords.y, 0, 'red');
const root = new Vertex(150, 150, 0, 'red');
root.heuristic = manhattanDistance(root, goal);
const graph = new Graph(root);
const a = new Vertex(120, 200, 0);
a.heuristic = manhattanDistance(a, goal);
const b = new Vertex(180, 200, 0);
b.heuristic = manhattanDistance(b, goal);
const c = new Vertex(150, 250, 0);
c.heuristic = manhattanDistance(c, goal);
const d = new Vertex(210, 250, 0);
d.heuristic = manhattanDistance(d, goal);
b.appendChild(c);
b.appendChild(d);
const e = new Vertex(180, 300, 0);
e.heuristic = manhattanDistance(e, goal);
d.appendChild(goal);
d.appendChild(e);
root.appendChild(a);
root.appendChild(b);
// Render the graph
renderGraph(graph.root);
graph.bestFirstSearch(root, goal).then((path) => graph.renderPath(path));
