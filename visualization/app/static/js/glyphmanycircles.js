function glyphmanycircles(selection) {													  
	let r = [5]
	let fill = "steelblue"

	function glyph(selection) {												 
		let n = r.length

		let angleScale = d3.scaleLinear()
			.domain([0, n])
			.range([0, 2 * Math.PI])

		function construct(enter) {
			let sel = enter
				.append("g")
				.attr("class", "glyphcircle")
			for (let i = 0; i < n; i++) {
				sel
					.append("circle")
					.attr("class", "circle_" + i)
					.attr("cx", 10 * Math.cos(angleScale(i)))
					.attr("cy", 10 * Math.sin(angleScale(i)))
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
			let g = d3.select(nodes[i])										  
			for (let i = 0; i < n; i++) {
				g.select(".circle_" + i)
					.attr("r", r[i])
					.attr("fill", fill)
			}
		})																	   
	}																			

	glyph.r = function(value) {												 
		if (!arguments.length) return r
		r = value																
		return glyph															
	}																			

	glyph.fill = function(value) {												 
		if (!arguments.length) return fill
		fill = value
		return glyph															
	}																			

	return glyph;															   
}	
