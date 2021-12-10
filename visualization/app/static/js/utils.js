// Convert radians to degrees
function radToDeg(x) {
	return x * 180 / Math.PI
}

// Clones an object (array, etc.)
function clone(x) {
	return JSON.parse(JSON.stringify(x))
}

// Transforms numeric variables to numbers
function toNumeric(data) {
	return data.map(d => {
		let obj = {...d}
		for (key in d) {
			if (!isNaN(d[key])) {
				obj[key] = +d[key]
			}
		}
		return obj
	})
}

function round(x, digits) {
	let a = Math.pow(10, digits)
	return Math.floor(x * a) / a
}

function quantile(x, p) {
	let vals = x.sort()
	return (vals[Math.floor(p * x.length)])
}


function fitToSize(graph, width, height) {
	let xExtent = d3.extent(graph.nodes, d => d.x);
	let yExtent = d3.extent(graph.nodes, d => d.y);
	let xSize = xExtent[1] - xExtent[0];
	let ySize = yExtent[1] - yExtent[0];
	let aspectRatio = xSize / ySize;
	let screenAspectRatio = width / height;

	let pad = 10

	let xLow = 0,
		xHigh = 0,
		yLow = 0,
		yHigh = 0;
	if (aspectRatio <= screenAspectRatio) {
		let screenXSize = aspectRatio * height;
		let screenPad = (width - screenXSize) / 2;
		xLow = screenPad;
		xHigh = width - screenPad;
		yLow = pad;
		yHigh = height - pad;
	}
	else {
		let screenYSize = width / aspectRatio;
		let screenPad = (height - screenYSize) / 2;
		xLow = pad;
		xHigh = width - pad;
		yLow = screenPad;
		yHigh = height - screenPad;
	}

	let xScale = d3.scaleLinear()
		.domain(d3.extent(graph.nodes, d => d.x))
		.range([xLow, xHigh]);

	let yScale = d3.scaleLinear()
		.domain(d3.extent(graph.nodes, d => d.y))
		.range([yLow, yHigh]);

	return {
		xScale: xScale,
		yScale: yScale
	}
}

function limitStr(x, len) {
	if (x.length <= len) {
		return x
	}
	else {
		return x.substr(0, len - 3) + "..."
	}
}


