function glyphtwocircles(selection) {													  
	let r1 = 5																	
	let r2 = 5																	
	let fill1 = "steelblue"
	let fill2 = "steelblue"

	function construct(enter) {
		let sel = enter
			.append("g")
			.attr("class", "glyphcircle")
		sel
			.append("circle")
			.attr("class", "circle1")
			.attr("cx", -10)
		sel
			.append("circle")
			.attr("class", "circle2")
			.attr("cx", 10)
		return sel
	}
																				 
	function glyph(selection) {												 
		let containers = selection
			.join(
				construct,
				update => update,
				exit => exit.remove()
			)

		containers.each((d, i, nodes) => {										
			let g = d3.select(nodes[i])										  
			g.select(".circle1")
				.attr("r", r1)
				.attr("fill", fill1)
			g.select(".circle2")
				.attr("r", r2)
				.attr("fill", fill2)
		})																	   
	}																			
																				 
	glyph.r1 = function(value) {												 
		if (!arguments.length) return r1
		r1 = value																
		return glyph															
	}																			

	glyph.r2 = function(value) {												 
		if (!arguments.length) return r2
		r2 = value																
		return glyph															
	}																			

	glyph.fill1 = function(value) {												 
		if (!arguments.length) return fill1
		fill1 = value																
		return glyph															
	}																			

	glyph.fill2 = function(value) {												 
		if (!arguments.length) return fill2
		fill2 = value																
		return glyph															
	}																			
																				 
	return glyph;															   
}	
