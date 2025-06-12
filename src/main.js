const randomButton$ = document.querySelector('#randomBtn');
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

const state = {
    nodes: 2,
    density: 1,
    loops: false,
    directed: false,
    weighted: true,
}

function updateState() {
    state.nodes = nodesField$.value;
    state.density = densityField$.value;
    state.loops = loopCheckbox$.checked;
    state.directed = directedCheckbox$.checked;
}

function clearState() {
    state.nodes = 2;
    state.density = 1;
    state.loops = false;
    state.directed = false;
    nodesField$.value = 2;
    densityField$.value = 1;
    loopCheckbox$.checked = false;
    directedCheckbox$.checked = false;
}


