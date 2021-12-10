function glyphcircle(selection) {													  
	let r = 5																	
	let fill = "steelblue"

	function construct(enter) {
		let sel = enter
			.append("g")
			.attr("class", "glyphcircle")
		sel
			.append("circle")
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
			g.select("circle")
				.attr("r", r)
				.attr("fill", fill)
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
