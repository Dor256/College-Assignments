"use strict";
let met = false;
// Queue class for BFS
class Queue {
    constructor() {
        this.array = [];
    }
    enqueue(element) {
        this.array.unshift(element);
        return this.array.length;
    }
    dequeue() {
        return this.array.pop();
    }
    isEmpty() {
        return this.array.length === 0;
    }
}
// Vertex class representing vertices in graph
let Vertex = /** @class */ (() => {
    class Vertex {
        constructor(x, y, color = 'blue') {
            this.adjList = [];
            this.visited = false;
            this.x = x;
            this.y = y;
            this.color = color;
            this.children = [];
            this.id = ++Vertex._id;
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
    // BFS Algorithm
    async BFS(vertex) {
        const queue = new Queue();
        const visited = new Set();
        const map = {};
        queue.enqueue(vertex);
        visited.add(vertex);
        await vertex.visit();
        while (!queue.isEmpty()) {
            if (met) {
                return map;
            }
            const currentVertex = queue.dequeue();
            const filteredAdj = currentVertex?.adjList.filter((child) => !visited.has(child));
            const shouldStop = filteredAdj?.some((child) => child.visited);
            if (shouldStop) {
                const intersection = filteredAdj?.find((child) => child.visited);
                met = true;
                this.intersectionVertex = intersection;
                map[intersection.id] = currentVertex;
                renderEdge(currentVertex, intersection, 'green');
                return map;
            }
            for (const adj of filteredAdj) {
                map[adj.id] = currentVertex;
                if (met) {
                    await adj.visit();
                    return map;
                }
                queue.enqueue(adj);
                visited.add(adj);
                await adj.visit(currentVertex);
            }
        }
    }
    // Bi Directional BFS Algorithm
    async biDirectionalBFS(src, dest) {
        const firstPromise = this.BFS(src);
        const secondPromise = this.BFS(dest);
        const firstMap = await firstPromise;
        const secondMap = await secondPromise;
        if (firstMap && secondMap) {
            const intersection = this.findIntersection(firstMap, secondMap);
            this.intersectionVertex.color = 'purple';
            renderVertex(this.intersectionVertex);
            renderEdge(firstMap[intersection], this.intersectionVertex, 'purple');
            renderEdge(secondMap[intersection], this.intersectionVertex, 'purple');
            this.renderShortestPath(firstMap, firstMap[intersection]);
            this.renderShortestPath(secondMap, secondMap[intersection]);
        }
    }
    // Finds the intersection point and returns it's vertex id
    findIntersection(firstMap, secondMap) {
        return Number(Object.keys(firstMap).filter((key) => key in secondMap)[0]);
    }
    // Renders the shortest path found by Bi Directional BFS
    renderShortestPath(map, currentVertex) {
        if (currentVertex) {
            currentVertex.color = 'purple';
            renderVertex(currentVertex);
            if (map[currentVertex.id]) {
                renderEdge(currentVertex, map[currentVertex.id], 'purple');
            }
            this.renderShortestPath(map, map[currentVertex.id]);
        }
        else {
            return;
        }
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
// Create the graph, append children, and render
const root = new Vertex(20, 150, 'red');
const graph = new Graph(root);
const a = new Vertex(60, 90);
const a1 = new Vertex(50, 67);
const a2 = new Vertex(75, 70);
a.appendChild(a1);
a.appendChild(a2);
const b = new Vertex(80, 150);
const b1 = new Vertex(100, 120);
const b2 = new Vertex(140, 150);
const b3 = new Vertex(100, 180);
b.appendChild(b1);
b.appendChild(b2);
b.appendChild(b3);
const c = new Vertex(60, 210);
const c1 = new Vertex(50, 230);
const c2 = new Vertex(75, 233);
c.appendChild(c1);
c.appendChild(c2);
const e = new Vertex(200, 150);
const e1 = new Vertex(180, 120);
const e2 = new Vertex(180, 180);
e.appendChild(e1);
e.appendChild(e2);
b2.appendChild(e);
const goal = new Vertex(260, 150, 'red');
const f = new Vertex(230, 90);
const f1 = new Vertex(220, 67);
const f2 = new Vertex(245, 70);
f.appendChild(f1);
f.appendChild(f2);
goal.appendChild(f);
e.appendChild(goal);
const g = new Vertex(230, 210);
const g1 = new Vertex(220, 230);
const g2 = new Vertex(245, 233);
g.appendChild(g1);
g.appendChild(g2);
goal.appendChild(g);
graph.root.appendChild(a);
graph.root.appendChild(b);
graph.root.appendChild(c);
// Render the graph
renderGraph(graph.root);
// Run Bi Directional BFS
graph.biDirectionalBFS(root, goal);
