Promise.all([
	d3.csv("/static/data/low_cost_sensors.csv"),
	d3.csv("/static/data/results.csv"),
	// d3.csv("data/low_cost_sensor_data_Nov_Feb.csv"),
]).then(res => {

	// Preprocessing
	// ================================================================

	let sensors = toNumeric(res[0])
	let data = toNumeric(res[1])


	// Pre-process sensor data
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


	// Pre-process data
	for (let i = 0; i < data.length; i++) {
		let d = data[i]
		d.lat = sensorDict[d.deviceID].lat
		d.lon = sensorDict[d.deviceID].lon
		// d.temperature = +d.temperature
	}
	console.log("data", data)

	// let params = ["PM10", "PM2.5", "NO", "NO2", "O3"]
	let params = ["PM10", "PM2.5", "NO2"]

	// Remove unusual values
	let dataClean = data.map(d => {
		let obj = {...d}
		for (p of params) {
			if (d[p] > 100) {
				obj[p] = null
			}
		}
		return obj
	})
	console.log("dataClean", dataClean)

	// Summary info
	let dataSum = {}
	for (p of params) {
		dataSum[p] = {
			mean: d3.mean(dataClean, d => d[p]),
			sd: d3.deviation(dataClean, d => d[p])
		}
	}
	console.log("dataSum", dataSum)

	// Normalize data
	let dataNorm = dataClean.map(d => {
		let obj = {...d}
		for (p of params) {
			obj[p] = d[p] / dataSum[p].sd
		}
		return obj
	})
	console.log("dataNorm", dataNorm)


	// Pivot data
	
	let groupsTime = d3.nest()
		.key(d => d.timestamp)
		.entries(dataClean)
	console.log("groupsTime", groupsTime)

	let groupsSensor = d3.nest()
		.key(d => d.deviceID)
		.entries(dataClean)
	console.log("groupsSensor", groupsSensor)

	let groupsTimeNorm = d3.nest()
		.key(d => d.timestamp)
		.entries(dataNorm)
	console.log("groupsTime (normalized)", groupsTime)

	let groupsSensorNorm = d3.nest()
		.key(d => d.deviceID)
		.entries(dataNorm)
	console.log("groupsSensor (normalized)", groupsSensor)


	// time windows
	let wsize = 50
	let windows = groupsTimeNorm.map((g, i) => {
		return groupsTimeNorm.filter((d, j) => j > i - wsize && j <= i)
	})
	console.log("windows", windows)

	let wavg = windows.map(w => {
		let obj = {}
		obj.key = w[w.length - 1].key
		let timestamp = +obj.key
		let values = clone(w[0].values)
		for (let sensorIdx = 0; sensorIdx < values.length; sensorIdx++) {
			values[sensorIdx].timestamp = timestamp
			for (p of params) {
				values[sensorIdx][p] = d3.mean(w, d => d.values[sensorIdx][p])
			}
		}
		obj.values = values
		return obj
	})
	console.log("wavg", wavg)


	// Distance matrices
	
	function distAvg(g1, g2) {
		let avg1 = params.map(p => d3.mean(g1.values, d => d[p]))
		let avg2 = params.map(p => d3.mean(g2.values, d => d[p]))
		let sum = 0
		for (i = 0; i < avg1.length; i++) {
			sum += (avg1[i] - avg2[i]) * (avg1[i] - avg2[i])
		}
		return sum
	}

	function cor(v1, v2) {
		let mu1 = d3.mean(v1)
		let mu2 = d3.mean(v2)
		let s1 = d3.deviation(v1)
		let s2 = d3.deviation(v2)
		let cov = 0
		for (let i = 0; i < v1.length; i++) {
			cov += (v1[i] - mu1) * (v2[i] - mu2)
		}
		cov /= v1.length
		return 1 - Math.abs(cov / (s1 * s2))
	}

	function distCor(g1, g2) {
		let p = "PM10"
		let v1 = g1.values.map(d => d[p])
		let v2 = g2.values.map(d => d[p])
		return cor(v1, v2)
	}

	let Ds = windows.map(w => {
		// gather data
		let wdata = w.reduce((acc, cur) => [...acc, ...cur.values], [])
		// group by sensor
		let gdata = d3.nest()
			.key(d => d.deviceID)
			.entries(wdata)
		let D = gdata.map(g1 => gdata.map(g2 => distAvg(g1, g2)))	
		return D
	})
	console.log("Ds", Ds)





	// Visualization
	// =================================================================
	
	let width = 400
	let height = 400
	let groupIdx = 0
	let selectedDevices = []


	// Map
	// -------------------------------------------------
	
	function updateMap(groupIdx) {
		let points = g
			.selectAll(".glyphpolygon")
			.data(groupsTime[groupIdx].values)
			.call(gl)
				// .attr("r", d => sizeScale(d["PM10"]))
				// .attr("fill", d => colorScale(d["temperature"]))
	}

	let mean_lat = d3.mean(sensors, d => d.lat)
	let mean_lon = d3.mean(sensors, d => d.lon)
	console.log(mean_lat)
	console.log(mean_lon)

	
	// see https://bost.ocks.org/mike/leaflet/

	function projectPoint(x, y) {
		var point = map.latLngToLayerPoint(new L.LatLng(y, x));
		this.stream.point(point.x, point.y);
	}

	d3.select("#map_container")
		.style("width", width)
		.style("height", height);

	let map = L.map("map_container")
		// .setView([40.65, 22.9], 13)
		.setView([mean_lat, mean_lon], 11)
		.addLayer(L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'));

	// see https://groups.google.com/g/leaflet-js/c/bzM9ssegitU

	let svgLayer = L.svg()
	svgLayer.addTo(map)
	let svg = d3.select("#map_container").select("svg")

	let g = svg.select("g")
		.attr("class", "leaflet-zoom-hide");


	// function valueScale(param) {
		// let values = data.map(d => d[param])
		// let q = quantile(values, 0.95)
		// let scale = d3.scaleLinear()
			// .domain([0, q])
			// .range([5, 20])
		// return function(x) {
			// return x <= q ? scale(x) : 40
		// }
	// }
	
	function valueScale(param) {
		let values = data.map(d => d[param])
		let q = quantile(values, 0.95)
		let scale = d3.scaleLinear()
			.domain([0, q])
			.range([5, 20])
		return function(x) {
			return x <= q ? scale(x) : 40
		}
	}

	// function valueScale(param) {
		// let values = dataNorm.map(d => d[param])
		// // let q = quantile(values, 0.95)
		// let scale = d3.scaleLinear()
			// .domain([0, 3])
			// .range([5, 30])
		// // return function(x) {
			// // return x <= q ? scale(x) : 40
		// // }
		// return scale
	// }

	// let colorScale = d3.scaleLinear()
		// // .domain(d3.extent(data, d => d["temperature"]))
		// .domain([0, 20])
		// .range(["blue", "red"])
	// console.log("colorScale", colorScale)

	let colorScale = function(d) {
		let a = 10
		if (d["PM10"] * a < 60 && d["PM2.5"] * a < 30)
			return "green"
		if (d["PM10"] * a < 120 && d["PM2.5"] * a < 50)
			return "yellow"
		if (d["PM10"] * a < 400 && d["PM2.5"] * a < 150)
			return "orange"
		return "purple"
	}

	let timeScale = d3.scaleTime()
		// .domain(d3.extent(data, d => d.timetamp).map(d => new Date(d)))
		// .domain([1606784400000, 1609974000000])
		.domain(d3.extent(data, d => +d.timestamp))
		.range([0, 2 * width])
	console.log("timeScale", timeScale)

	// let gl = glyphcircle()
		// .r(d => valueScale("PM10")(d["PM10"]))
		// .fill(d => colorScale(d["temperature"]))

	// let gl = glyphtwocircles()
		// .r1(d => sizeScale(d["PM10"]))
		// .r2(d => sizeScale(d["PM2.5"]))
		// .fill1(d => colorScale(d["temperature"]))
		// .fill2(d => colorScale(d["temperature"]))

	// let gl = glyphmanycircles()
		// .r([
			// d => sizeScale(d["PM10"]),
			// d => noScale(d["NO"]),
			// d => sizeScale(d["PM2.5"])
		// ])
		// .fill(d => colorScale(d["temperature"]))
	
	let scales = params
		.map(d => valueScale(d))
		.map((f, i) => (d => f(d[params[i]])))

	// let impScales = params
		// .map(d => {
			// let scale = d3.scaleLinear()
				// .domain([0, 1])
				// .range([0, 1])
			// return scale
		// })
		// .map((f, i) => (d => f(d["imp_" + params[i]])))
	
	// let impScale = d3.scaleLinear()
		// .domain([0, d3.max(importances_pm10_2, d => d.importance)])
		// .range([0, 1])
	
	// let gl = glyphpolygon()
		// .r(scales)
		// .l(params)
		// .t(params.map(p => (d => round(d[p], 2))))
		// .fill(d => colorScale(d["temperature"]))
		// .stroke(d => selectedDevices.includes(d.deviceID) ? "orange" : "none")

	let gl = glyphstar()
		.r(scales)
		.l(params)
		.t(params.map(p => (d => round(d[p], 2))))
		.fill(d => colorScale(d))
		.stroke(d => selectedDevices.includes(d.deviceID) ? "red" : "none")

	// initialize points
	let pointsEnter = g
		.selectAll(".glyphpolygon")
		.data(groupsTime[groupIdx].values)
		.call(gl)
		// .append("circle")
			// .attr("r", d => sizeScale(d["PM10"]))
			// .attr("fill", d => colorScale(d["temperature"]))

	map.on("zoomend", reset);
	reset();

	// Reposition the SVG to cover the features.
	function reset() {				
		// transform lat lon to x-y coordinates
		transformedData = groupsTime[groupIdx].values.map(d => {
			return map.latLngToLayerPoint(new L.LatLng(d["lat"], d["lon"]));
		});
		
		// draw points
		g.selectAll(".glyphpolygon")
			.data(transformedData)
				.attr("transform", d => `translate(${d.x} ${d.y})`)
	}
	




	// Graph
	// -------------------------------------------------
	
	let svgGraph = d3.select("#graph_container")
		.append("svg")
			.attr("width", width)
			.attr("height", height)

	let nodesEnter = svgGraph.selectAll(".node")
		.data(sensors)
		.enter()
		.append("circle")
			.attr("class", "node")
			.attr("r", 6)
			.attr("fill", "steelblue")

	let nodesLabelsEnter = svgGraph.selectAll(".nodeLabel")
		.data(sensors)
		.enter()
		.append("text")
			.attr("class", "nodeLabel")
			.attr("fill", "gray")
			.text(d => limitStr(d.deviceName, 10))
			.style("font-family", "sans-serif")
			.style("font-size", 10)

	
	let edgeData = []
	let nodes = []
	let xScaleGraph = null
	let yScaleGraph = null
	function updateGraph(groupIdx) {
		// // let df = groupsNorm[groupIdx].values
		// let df = wavg[groupIdx].values
		// // console.log("df", df)

		// // Feature matrix
		// let features = params
		// let X = df.map(d => features.map(f => d[f]))
		// // console.log("X", X)
		
		// edgeData = createEdges(X)


		let df = groupsTime[groupIdx].values
		svgGraph.selectAll(".node")
			.attr("fill", (d, i) => colorScale(df[i]))
		
		edgeData = createEdgesDist(Ds[groupIdx])

		// Create or remove edges as necessary
		let edgesEnter = svgGraph.selectAll(".edge")
			.data(edgeData, e => e.id)
			.enter()
			.append("line")
				.attr("class", "edge")
				.attr("stroke", "gray")
				.attr("opacity", 0.5)

		let edgesExit = svgGraph.selectAll(".edge")
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
			// .alphaDecay(0.5)
			.alphaDecay(0.3)

		simulation.on("tick", () => {
			let scales = fitToSize({nodes: sensors, edges: edgeData}, width - 30, height)
			xScaleGraph = scales.xScale
			yScaleGraph = scales.yScale

			let edges = svgGraph.selectAll(".edge")
				.data(edgeData, e => e.id)
					.attr("x1", e => xScaleGraph(e.source.x))
					.attr("y1", e => yScaleGraph(e.source.y))
					.attr("x2", e => xScaleGraph(e.target.x))
					.attr("y2", e => yScaleGraph(e.target.y))

			nodes = svgGraph.selectAll(".node")
				.data(sensors)
					.attr("cx", d => xScaleGraph(d.x))
					.attr("cy", d => yScaleGraph(d.y))

			nodeLabels = svgGraph.selectAll(".nodeLabel")
				.data(sensors)
					.attr("x", d => xScaleGraph(d.x) + 5)
					.attr("y", d => yScaleGraph(d.y) - 5)
		})
	}

	updateGraph(groupIdx)
	console.log("edges", edgeData)
	
	
	// Brush
	svgGraph.append("g")
		.attr("class", "brush")
		.call(d3.brush()
			.on("start brush end", brushed)
		)

	function brushed() {
		let selection = d3.event.selection
		if (selection === null) {
			nodes.attr("r", 5)
			nodeLabels.style("font-size", 10)
		}
		else {
			nodes.attr("r", d => inArea(d, selection) ? 10 : 6)
			nodeLabels.style("font-size", d => inArea(d, selection) ? 12 : 10)
			selNodes = nodes.filter(d => inArea(d, selection)).data()
			selectedDevices = selNodes.map(d => d.deviceID)
			// console.log("selectedDevices", selectedDevices)
		}
		updateMap(groupIdx)
	}

	function inArea(d, area) {
		[[x0, y0], [x1, y1]] = area
		if (xScaleGraph(d.x) >= x0 && xScaleGraph(d.x) <= x1 &&
			yScaleGraph(d.y) >= y0 && yScaleGraph(d.y) <= y1)
			return true
		else
			return false
	}


	// Timeline
	
	function createTimeLine(container, param) {
		// summarize
		let sumParam = param
		let groupsSum = groupsTime.map(g => ({
			timestamp: +g.key,
			value: d3.mean(g.values, d => d[sumParam])
		}))
		console.log("groupsSum", groupsSum)

		let timeHeight = 50

		let yScale = d3.scaleLinear()
			.domain([0, d3.max(groupsSum, d => d.value)])
			.range([timeHeight, 0])

		let timeSvg = container
			.append("svg")
				.attr("width", 2 * width)
				.attr("height", timeHeight)
		timeSvg
			.append("path")
				.datum(groupsSum)
				.attr("stroke", "gray")
				.attr("fill", "none")
				.attr("d", d3.line()
					.x(d => timeScale(d.timestamp))
					.y(d => yScale(d.value))
				)
		timeSvg
			.append("path")
				.datum(groupsSum)
				.attr("stroke", "none")
				.attr("fill", "lightgray")
				.attr("d", d3.area()
					.x(d => timeScale(d.timestamp))
					.y0(timeHeight)
					.y1(d => yScale(d.value))
				)

		timeSvg
			.append("g")
				.attr("transform", `translate(${0} ${0})`)
				.call(d3.axisRight(yScale).ticks(4))

		// Vertical line
		let markerLine = timeSvg
			.append("line")
				.attr("class", "markerLine")
				.attr("x1", timeScale(groupsTime[groupIdx].key))
				.attr("x2", timeScale(groupsTime[groupIdx].key))
				.attr("y1", 0)
				.attr("y2", timeHeight)
				.attr("stroke", "steelblue")

		// Vertical line label
		let markerLabel = timeSvg
			.append("text")
				.attr("class", "markerLabel")
				.attr("x", timeScale(groupsTime[groupIdx].key))
				.attr("y", 0)
				.attr("text-anchor", "left")
				.attr("dominant-baseline", "hanging")
				.style("font-family", "sans-serif")
				.style("font-size", 12)

		// Time window
		let xidx1 = Math.max(groupIdx - wsize, 0)
		let x1 = timeScale(groupsTime[xidx1].key)
		let x2 = timeScale(groupsTime[groupIdx].key)
		let markerWindow = timeSvg
			.append("rect")
				.attr("class", "markerWindow")
				.attr("x", x1)
				.attr("y", 0)
				.attr("width", x2 - x1)
				.attr("height", timeHeight)
				.attr("fill", "lightgreen")
				.attr("opacity", 0.3)

		// Label
		timeSvg
			.append("text")
				.text("Average " + param)
				.attr("dominant-baseline", "hanging")
				.attr("text-anchor", "end")
				.attr("x", 2 * width)
				.style("font-family", "sans-serif")
				.style("font-size", 12)
	}

	let timeFormatter = d3.timeFormat("%d %b %Y, %H:%M:%S")
	
	function updateTimeline(groupIdx) {
		let curPos = timeScale(groupsTime[groupIdx].key)

		d3.selectAll(".markerLine")
			.attr("x1", curPos)
			.attr("x2", curPos)

		d3.select(".markerLabel")
			.attr("x", curPos + 5)
			.text(timeFormatter(groupsTime[groupIdx].key))

		let xidx1 = Math.max(groupIdx - wsize, 0)
		let x1 = timeScale(groupsTime[xidx1].key)
		let x2 = curPos
		d3.selectAll(".markerWindow")
			.attr("x", x1)
			.attr("width", x2 - x1)
	}

	for (p of params) {
		let timeDiv = d3.select("#controls")
			.append("div")
		createTimeLine(timeDiv, p)
	}


	// Slider
	// ================================================================
	
	d3.select("#controls")
		.append("input")
			.attr("id", "slider1")
			.attr("class", "slider")
			.attr("type", "range")
			.attr("min", 0)
			.attr("max", groupsTime.length)
			.attr("value", 0)
			.style("width", 2 * width + 15)

	let slider = d3.select("#slider1")
	slider.on("input", (d, i, nodes) => {
		let sliderValue = nodes[i].value
		// console.log(sliderValue)

		groupIdx = sliderValue

		updateMap(groupIdx)
		updateGraph(groupIdx)
		updateTimeline(groupIdx)
	})


	// Time axis

	d3.select("#controls")
		.append("div")
		.append("svg")
			.attr("width", 2 * width)
			.attr("height", 30)
		.append("g")
			.attr("transform", `translate(0 10)`)
			.call(d3.axisBottom(timeScale).ticks(d3.timeWeek))

})

