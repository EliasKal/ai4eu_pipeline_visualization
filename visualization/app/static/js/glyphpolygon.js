function glyphpolygon(selection) {													  
	let r = [5]
	let l = ["A"]
	let t = [0]
	let fill = "steelblue"
	let stroke = "none"
	let dist = 50

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
						.attr("class", "circle_" + i)
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
				y: r * Math.sin(angleScale(i))
			}))

			let g = d3.select(nodes[i])										  
			g.select("polygon")
				.style("pointer-events", "auto")
				.attr("points", points.map(p => `${p.x},${p.y}`).join(" "))
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
						.selectAll("circle")
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
						.selectAll("circle")
						.style("visibility", "hidden")
					g	
						.selectAll("text")
						.style("visibility", "hidden")
				})

			for (let i = 0; i < n; i++) {
				g.select(".circle_" + i)
					.attr("r", 25)
					.attr("opacity", 0.9)
			}
			for (let i = 0; i < n; i++) {
				let lab = typeof l[i] === "function" ? l[i](d) : l[i]
				let txt = typeof t[i] === "function" ? t[i](d) : t[i]
				g.select(".label_" + i)
					.text(lab)
				g.select(".text_" + i)
					.text(txt)
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

	return glyph;															   
}

