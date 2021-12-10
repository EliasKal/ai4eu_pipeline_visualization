function createGraph(X) {
	let n = X.length

	// Distance matrix
	let D = X.map(v1 => X.map(v2 => dist(v1, v2)))
	console.log("D", D)

	let nodes = X.map((v, i) => ({idx: i, values: v}))
	let edges = nearestNeighborsEdges(D, 4)

	return {
		nodes: nodes,
		edges: edges
	}
}

function createEdges(X) {
	let n = X.length

	// Distance matrix
	let D = X.map(v1 => X.map(v2 => dist(v1, v2)))
	// console.log("D", D)

	let edges = nearestNeighborsEdges(D, 4)

	// Add a unique ID to each edge
	edges = edges.map(e => {
		let obj = {...e}	
		let st = [+e.source, +e.target].sort(d3.ascending)
		obj.id = `${st[0]}-${st[1]}`
		return obj
	})

	return edges
}

function createEdgesDist(D) {
	let edges = nearestNeighborsEdges(D, 4)

	// Add a unique ID to each edge
	edges = edges.map(e => {
		let obj = {...e}	
		let st = [+e.source, +e.target].sort(d3.ascending)
		obj.id = `${st[0]}-${st[1]}`
		return obj
	})

	return edges
}

function dist(v1, v2) {
	let d = v1.length
	let res = 0
	for (i = 0; i < d; i++) {
		res += (v1[i] - v2[i]) * (v1[i] - v2[i])
	}
	return Math.sqrt(res)
}

function nearestNeighborsEdges(D, k) {
	let idx = [...Array(D.length).keys()];
	let edges = [];
	for (let i = 0; i < D.length; i++) {
		let sortedIdx = idx.sort((a, b) => D[i][a] > D[i][b]);
		for (let j = 1; j < k + 1; j++) {
			let e = {
				source: i,
				target: sortedIdx[j],
				multiplicity: 1
			};
			if (!containEdge(edges, e)) {
				edges.push(e);
			}
		}
	}
	return edges;
}

function containEdge(edges, e) {
	for (let i = 0; i < edges.length; i++) {
		if ((edges[i].source == e.source) &&
			(edges[i].target == e.target)) {
				return true;
		}
		if ((edges[i].source == e.target) &&
			(edges[i].target == e.source)) {
				return true;
		}
	}
	return false;
}

