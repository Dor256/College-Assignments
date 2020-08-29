"use strict";
// Vertex class representing vertices in graph
let Vertex = /** @class */ (() => {
    class Vertex {
        constructor(x, y, heuristic, dist = 0, color = 'blue') {
            this.adjList = [];
            this.visited = false;
            this.x = x;
            this.y = y;
            this.color = color;
            this.children = [];
            this.id = ++Vertex._id;
            this.heuristic = heuristic;
            this.distanceFromSrc = dist;
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
    ctx.strokeStyle = 'black';
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
function distanceFromSource(src, curr) {
    return manhattanDistance(src, curr) + src.distanceFromSrc;
}
// Create the graph, append children, and render
const goalCoords = { x: 155, y: 325 };
const goal = new Vertex(goalCoords.x, goalCoords.y, 0, 0, 'red');
const root = new Vertex(150, 150, 0, 0, 'red');
root.heuristic = manhattanDistance(root, goal) + distanceFromSource(root, root);
const graph = new Graph(root);
const a = new Vertex(120, 200, 0);
a.distanceFromSrc = distanceFromSource(root, a);
a.heuristic = manhattanDistance(a, goal) + a.distanceFromSrc;
const a1 = new Vertex(145, 275, 0);
a1.distanceFromSrc = distanceFromSource(a, a1);
a1.heuristic = manhattanDistance(a1, goal) + a1.distanceFromSrc;
a.appendChild(a1);
const a2 = new Vertex(95, 240, 0);
a2.distanceFromSrc = distanceFromSource(a, a2);
a2.heuristic = manhattanDistance(a2, goal) + a2.distanceFromSrc;
a.appendChild(a2);
const b = new Vertex(200, 200, 0);
b.distanceFromSrc = distanceFromSource(root, b);
b.heuristic = manhattanDistance(b, goal) + b.distanceFromSrc;
const c = new Vertex(180, 250, 0);
c.distanceFromSrc = distanceFromSource(b, c);
c.heuristic = manhattanDistance(c, goal) + c.distanceFromSrc;
c.appendChild(goal);
const d = new Vertex(210, 250, 0);
d.distanceFromSrc = distanceFromSource(b, d);
d.heuristic = manhattanDistance(d, goal) + d.distanceFromSrc;
b.appendChild(c);
b.appendChild(d);
d.appendChild(goal);
a2.appendChild(goal);
a1.appendChild(goal);
root.appendChild(a);
root.appendChild(b);
// Render the graph
renderGraph(graph.root);
graph.bestFirstSearch(root, goal).then((path) => graph.renderPath(path));
