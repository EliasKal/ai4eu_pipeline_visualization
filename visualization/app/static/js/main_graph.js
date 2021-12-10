Promise.all([
	d3.csv("data/low_cost_sensors.csv"),
	d3.csv("data/low_cost_sensor_data.csv")
]).then(res => {

	// Preprocessing
	// ================================================================

	let sensors = toNumeric(res[0])
	let data = toNumeric(res[1])

	for (let i = 0; i < sensors.length; i++) {
		sensors[i].lat = radToDeg(sensors[i].lat)
		sensors[i].lon = radToDeg(sensors[i].lon)
	}

	console.log("sensors", sensors)

	let sensorDict = {}
	for (s of sensors) {
		sensorDict[s.deviceID] = {lat: s.lat, lon: s.lon}
	}
	console.log("sensorDict", sensorDict)

	for (let i = 0; i < data.length; i++) {
		let d = data[i]
		d.lat = sensorDict[d.deviceID].lat
		d.lon = sensorDict[d.deviceID].lon
		d.temperature = +d.temperature
	}

	console.log(data)

	let groups = d3.nest()
		.key(d => d.timestamp)
		.entries(data)
	console.log("groups", groups)


	let width = 500
	let height = 500

	// Setup controls
	// ================================================================
	
	
	d3.select("#controls")
		.append("input")
			.attr("id", "slider1")
			.attr("class", "slider")
			.attr("type", "range")
			.attr("min", 0)
			.attr("max", groups.length)
			.attr("value", 0)
			.style("width", width)

	let slider = d3.select("#slider1")
	slider.on("input", (d, i, nodes) => {
		let sliderValue = nodes[i].value
		// console.log(sliderValue)

		groupIdx = sliderValue

		update(groupIdx)
	})



	let groupIdx = 0

	// Visualization
	// =================================================================
	
	let svg = d3.select("#container")
		.append("svg")
			.attr("width", width)
			.attr("height", height)

	let nodesEnter = svg.selectAll(".node")
		.data(sensors)
		.enter()
		.append("circle")
			.attr("class", "node")
			.attr("r", 5)
			.attr("fill", "steelblue")

	
	let edgeData = []
	let nodes = []
	let xScale = null
	let yScale = null
	function update(groupIdx) {
		let df = groups[groupIdx].values
		// console.log("df", df)

		// Feature matrix
		let features = ["PM10", "PM2.5", "NO", "NO2", "O3"]
		let X = df.map(d => features.map(f => d[f]))
		// console.log("X", X)
		
		edgeData = createEdges(X)

		// Create or remove edges as necessary
		let edgesEnter = svg.selectAll(".edge")
			.data(edgeData, e => e.id)
			.enter()
			.append("line")
				.attr("class", "edge")
				.attr("stroke", "gray")
				.attr("opacity", 0.5)

		let edgesExit = svg.selectAll(".edge")
			.data(edgeData, e => e.id)
			.exit()
			.remove()


		// Update positions
		let simulation = d3.forceSimulation(sensors);
		simulation
			.force("charge", d3.forceManyBody())
			.force("links", d3.forceLink(edgeData).distance(0))
			// .force("collision", d3.forceCollide(5))
			// .force("x", d3.forceX(width / 2).strength(0.01))
			// .force("y", d3.forceY(height / 2).strength(0.01))
			.alphaDecay(0.5)

		simulation.on("tick", () => {
			let scales = fitToSize({nodes: sensors, edges: edgeData}, width, height)
			xScale = scales.xScale
			yScale = scales.yScale

			let edges = svg.selectAll(".edge")
				.data(edgeData, e => e.id)
					.attr("x1", e => xScale(e.source.x))
					.attr("y1", e => yScale(e.source.y))
					.attr("x2", e => xScale(e.target.x))
					.attr("y2", e => yScale(e.target.y))

			nodes = svg.selectAll(".node")
				.data(sensors)
					.attr("cx", d => xScale(d.x))
					.attr("cy", d => yScale(d.y))
		})
	}

	update(groupIdx)
	console.log("edges", edgeData)
	
	
	let timeScale = d3.scaleTime()
		// .domain(d3.extent(data, d => d.timetamp).map(d => new Date(d)))
		.domain([1606784400000, 1609974000000])
		.range([0, width])
	console.log("timeScale", timeScale)

	d3.select("#controls")
		.append("div")
		.append("svg")
			.attr("width", width)
			.attr("height", 50)
		.append("g")
			.attr("transform", `translate(0 10)`)
			.call(d3.axisBottom(timeScale).ticks(d3.timeWeek))


	// Brush
	svg.append("g")
		.attr("class", "brush")
		.call(d3.brush()
			.on("start brush end", brushed)
		)

	function brushed() {
		let selection = d3.event.selection
		if (selection === null) {
			nodes.attr("r", 5)
		}
		else {
			nodes.attr("r", d => inArea(d, selection) ? 10 : 5)
			selNodes = nodes.filter(d => inArea(d, selection)).data()
			console.log("selNodes", selNodes)
		}
	}

	function inArea(d, area) {
		[[x0, y0], [x1, y1]] = area
		if (xScale(d.x) >= x0 && xScale(d.x) <= x1 &&
			yScale(d.y) >= y0 && yScale(d.y) <= y1)
			return true
		else
			return false
	}
})

