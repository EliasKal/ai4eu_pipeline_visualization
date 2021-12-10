function glyphstar(selection) {													  
	let r = [5]
	let l = ["A"]
	let t = [0]
	let fill = "steelblue"
	let stroke = "none"
	let dist = 50
	let circleOpacity = [1]
	let impR = [5]

	function glyph(selection) {												 
		let n = r.length

		let angleScale = d3.scaleLinear()
			.domain([0, n])
			.range([0, 2 * Math.PI])

		function construct(enter) {
			let sel = enter
				.append("g")
				.attr("class", "glyphpolygon")
			sel
				.append("polygon")
					.attr("opacity", 0.8)
			for (let i = 0; i < n; i++) {
				sel
					.append("circle")
						.attr("class", "infoCircle")
						.attr("cx", dist * Math.cos(angleScale(i)))
						.attr("cy", dist * Math.sin(angleScale(i)))
						.attr("fill", "white")
						.attr("stroke", "steelblue")
						.attr("stroke-width", 3)
						.style("visibility", "hidden")
				sel
					.append("text")
						.attr("class", "label_" + i)
						.attr("x", dist * Math.cos(angleScale(i)))
						.attr("y", dist * Math.sin(angleScale(i)) - 8)
						.attr("text-anchor", "middle")
						.attr("dominant-baseline", "central")
						.style("visibility", "hidden")
				sel
					.append("text")
						.attr("class", "text_" + i)
						.attr("x", dist * Math.cos(angleScale(i)))
						.attr("y", dist * Math.sin(angleScale(i)) + 8)
						.attr("text-anchor", "middle")
						.attr("dominant-baseline", "central")
						.attr("font-size", 14)
						.style("visibility", "hidden")
				// sel
					// .append("circle")
						// .attr("class", "impCircle_" + i)
						// .attr("cx", 10 * Math.cos(angleScale(i)))
						// .attr("cy", 10 * Math.sin(angleScale(i)))
						// .attr("r", 3)
						// .attr("fill", "steelblue")
						// .attr("stroke", "black")
			}
			return sel
		}

		let containers = selection
			.join(
				construct,
				update => update,
				exit => exit.remove()
			)

		containers.each((d, i, nodes) => {										
			let rs = r.map(v => {
				if (typeof v === "function") {
					return v(d)
				}
				else {
					return v
				}
			})

			let points = rs.map((r, i) => ({
				x: r * Math.cos(angleScale(i)),
				y: r * Math.sin(angleScale(i)),
				a: angleScale(i)
			}))

			let npoints = points.length
			let points2 = new Array(2 * npoints)
			let baseR = 5 
			for (let i = 0; i < npoints; i++) {
				points2[i * 2] = points[i]
				a2 = points[i].a + (2 * Math.PI) / (2 * npoints)
				points2[i * 2 + 1] = {
					x: baseR * Math.cos(a2),
					y: baseR * Math.sin(a2),
					a: a2
				}
			}
			// for (p of points) {
				// points2.push(p)
				// a2 = p.a + (2 * Math.PI) / (2 * points.length)
				// points2.push({
					// x: baseR * Math.cos(a2),
					// y: baseR * Math.sin(a2),
					// a: a2
				// })
			// }
			// console.log("points", points)
			// console.log("points2", points2)

			let g = d3.select(nodes[i])										  
			g.select("polygon")
				.style("pointer-events", "auto")
				.attr("points", points2.map(p => `${p.x},${p.y}`).join(" "))
				.attr("fill", fill)
				.attr("stroke", stroke)
				.attr("stroke-width", 3)
				.on("mouseover", (d, i, nds) => {
					d3.selectAll(nodes)
						.selectAll("polygon")
						.attr("opacity", 0.3)
					g
						.select("polygon")
						.attr("stroke", "steelblue")
						// .attr("stroke-width", 2)
						.attr("opacity", 1)
					g	
						.selectAll(".infoCircle")
						.style("visibility", "visible")
					g	
						.selectAll("text")
						.style("visibility", "visible")
				})
				.on("mouseout", (d, i) => {
					d3.selectAll(nodes)
						.selectAll("polygon")
						.attr("stroke", stroke)
						.attr("opacity", 0.8)
					g	
						.selectAll(".infoCircle")
						.style("visibility", "hidden")
					g	
						.selectAll("text")
						.style("visibility", "hidden")
				})

			// for (let i = 0; i < n; i++) {
				// g.select(".circle_" + i)
					// .attr("r", 25)
					// .attr("opacity", 0.9)
			// }
			g.selectAll(".infoCircle")
				.attr("r", 25)
				.attr("opacity", 0.9)
			for (let i = 0; i < n; i++) {
				let lab = typeof l[i] === "function" ? l[i](d) : l[i]
				let txt = typeof t[i] === "function" ? t[i](d) : t[i]
				g.select(".label_" + i)
					.text(lab)
				g.select(".text_" + i)
					.text(txt)
			}

			for (let i = 0; i < n; i++) {
				let op = typeof circleOpacity[i] === "function" ? circleOpacity[i](d) : circleOpacity[i]
				let ir = typeof impR[i] === "function" ? impR[i](d) : impR[i]
				g.select(".impCircle_" + i)
					.attr("opacity", op)
					.attr("r", ir)
			}
		})																	   
	}																			

	glyph.r = function(value) {												 
		if (!arguments.length) return r
		r = value																
		return glyph															
	}																			

	glyph.t = function(value) {												 
		if (!arguments.length) return t
		t = value
		return glyph															
	}																			

	glyph.l = function(value) {												 
		if (!arguments.length) return l
		l = value
		return glyph															
	}																			

	glyph.fill = function(value) {												 
		if (!arguments.length) return fill
		fill = value
		return glyph															
	}																			

	glyph.stroke = function(value) {												 
		if (!arguments.length) return stroke
		stroke = value
		return glyph															
	}																			

	glyph.circleOpacity = function(value) {												 
		if (!arguments.length) return circleOpacity
		circleOpacity = value
		return glyph															
	}																			

	glyph.impR = function(value) {												 
		if (!arguments.length) return impR 
		impR = value
		return glyph															
	}																			

	return glyph;															   
}

