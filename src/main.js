const randomButton$ = document.querySelector('#randomBtn');
const fileButton$ = document.querySelector('#fileButton')
const generateButton$ = document.querySelector('#generateBtn');
const clearButton$ = document.querySelector('#clearBtn');
const loopCheckbox$ = document.querySelector('#loops');
const directedCheckbox$ = document.querySelector('#directed');
const nodesField$ = document.querySelector('#nodes');
const densityField$ = document.querySelector('#density');


clearButton$.addEventListener('click', clearState);
nodesField$.addEventListener('change', updateState);
densityField$.addEventListener('change', updateState);
loopCheckbox$.addEventListener('change', updateState);
directedCheckbox$.addEventListener('change', updateState);
fileButton$.addEventListener('click', parseFile);
generateButton$.addEventListener('click', generateGraph);
randomButton$.addEventListener('click', randomGraph);

let adjMatrix = [];

const state = {
    nodes: 2,
    density: 1,
    loops: false,
    directed: false,
    weighted: true,
    graphField$: false,
}

function updateState() {
    state.nodes = nodesField$.value;
    state.density = densityField$.value;
    state.loops = loopCheckbox$.checked;
    state.directed = directedCheckbox$.checked
}

function clearState() {
    state.nodes = 0;
    state.density = 0;
    state.loops = false;
    state.directed = false;
    nodesField$.value = 0;
    densityField$.value = 0;
    loopCheckbox$.checked = false;
    directedCheckbox$.checked = false;
    adjMatrix = [];

    // Matrix- und Analyse-Ausgabe leeren
    document.getElementById("matrixDisplay").textContent = "Noch keine Matrix vorhanden.";
    document.getElementById("analysisOutput").textContent = "Noch keine Analyse.";

    // Canvas löschen
    const canvas = document.querySelector("#graphCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}


function parseFile() {
    const file = document.getElementById('fileInput').files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        const content = e.target.result;
        adjMatrix = content.trim().split('\n').map(line => line.split(',').map(Number));
        showMatrix();
        analyzeGraph();
        drawGraph();
    };
    reader.readAsText(file);
}

function generateGraph() {
    const n = parseInt(document.getElementById("nodes").value);
    const density = parseInt(document.getElementById("density").value);
    const allowLoops = document.getElementById("loops").checked;
    const directed = document.getElementById("directed").checked;
    adjMatrix = [];

    for (let i = 0; i < n; i++) {
        adjMatrix[i] = [];
        for (let j = 0; j < n; j++) {
            if (i === j && !allowLoops) {
                adjMatrix[i][j] = 0;
            } else {
                if (directed || j > i) {
                    adjMatrix[i][j] = Math.random() * 100 < density ? Math.floor(Math.random() * 10 + 1) : 0;
                } else if (j < i) {
                    adjMatrix[i][j] = adjMatrix[j][i];
                }
            }
        }
    }
    showMatrix();
    analyzeGraph();
    drawGraph();
}

function showMatrix() {
    const display = document.getElementById("matrixDisplay");
    display.textContent = adjMatrix.map(row => row.join(" ")).join("\n");
}

function dijkstra(start) {
    const n = adjMatrix.length;
    const dist = Array(n).fill(Infinity);
    const visited = Array(n).fill(false);
    dist[start] = 0;

    for (let i = 0; i < n; i++) {
        let u = -1;
        for (let j = 0; j < n; j++) {
            if (!visited[j] && (u === -1 || dist[j] < dist[u])) {
                u = j;
            }
        }

        if (dist[u] === Infinity) break;
        visited[u] = true;

        for (let v = 0; v < n; v++) {
            if (adjMatrix[u][v] > 0 && dist[u] + adjMatrix[u][v] < dist[v]) {
                dist[v] = dist[u] + adjMatrix[u][v];
            }
        }
    }
    return dist;
}

function analyzeGraph() {
    const n = adjMatrix.length;
    const distances = [];
    const exz = [];

    for (let i = 0; i < n; i++) {
        const dist = dijkstra(i);
        distances.push(dist);
        exz[i] = Math.max(...dist.filter(d => d < Infinity));
    }

    const radius = Math.min(...exz);
    const durchmesser = Math.max(...exz);
    const zentrum = exz.map((e, i) => ({e, i})).filter(obj => obj.e === radius).map(obj => obj.i);

    let output = "Distanzen:\n";
    distances.forEach((row, i) => {
        output += `Von Knoten ${i}: ${row.join(", ")}\n`;
    });

    output += "\nExzentrizitäten:\n";
    exz.forEach((e, i) => {
        output += `Knoten ${i}: ${e}\n`;
    });

    output += `\nRadius: ${radius}\n`;
    output += `Durchmesser: ${durchmesser}\n`;
    output += `Zentrum: { ${zentrum.join(", ")} }\n`;

    document.getElementById("analysisOutput").textContent = output;
}

function randomGraph() {
    const randomNodes = Math.floor(Math.random() * 8) + 3; // 3–10 Nodes
    const randomDensity = Math.floor(Math.random() * 70) + 30; // 30–100%
    document.getElementById("nodes").value = randomNodes;
    document.getElementById("density").value = randomDensity;
    document.getElementById("directed").checked = Math.random() < 0.5;
    document.getElementById("loops").checked = Math.random() < 0.3;
    generateGraph();
}

// Graph zeichnen (Kreise als Knoten, Linien als Kanten)
function drawGraph() {
    const canvas = document.getElementById("graphCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const n = adjMatrix.length;
    if (n === 0) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 150;

    const nodePos = [];

    // Positionen berechnen
    for (let i = 0; i < n; i++) {
        const angle = (2 * Math.PI / n) * i;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        nodePos.push({x, y});
    }

    // Kanten zeichnen
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (adjMatrix[i][j] > 0) {
                ctx.beginPath();
                ctx.moveTo(nodePos[i].x, nodePos[i].y);
                ctx.lineTo(nodePos[j].x, nodePos[j].y);
                ctx.strokeStyle = '#555';
                ctx.stroke();

                // Gewicht anzeigen
                const midX = (nodePos[i].x + nodePos[j].x) / 2;
                const midY = (nodePos[i].y + nodePos[j].y) / 2;
                ctx.fillStyle = 'red';
                ctx.fillText(adjMatrix[i][j], midX, midY);
            }
        }
    }

    // Knoten zeichnen
    for (let i = 0; i < n; i++) {
        ctx.beginPath();
        ctx.arc(nodePos[i].x, nodePos[i].y, 15, 0, 2 * Math.PI);
        ctx.fillStyle = 'lightblue';
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = 'black';
        ctx.fillText(i, nodePos[i].x - 4, nodePos[i].y + 4);
    }
}


