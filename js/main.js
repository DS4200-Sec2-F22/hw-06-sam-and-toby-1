const FRAME_HEIGHT = 450;
const FRAME_WIDTH = 450;
const MARGINS = {left:50, right:50, top:25, bottom:25}

const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;

const SETOSA_COLOR = "blue";
const VERSICOLOR_COLOR = "orange";
const VIRGINICA_COLOR = "limegreen";


//frame for length scatter plot
const LENGTHFRAME = d3.select("#length")
				.append("svg")
					.attr("height", FRAME_HEIGHT)
					.attr("width", FRAME_WIDTH)
					.attr("class", "frame");

//frame for width scatter plat
const WIDTHFRAME = d3.select("#width")
				.append("svg")
					.attr("height", FRAME_HEIGHT)
					.attr("width", FRAME_WIDTH)
					.attr("class", "frame");

//frame being used for counts bar plot
const BARFRAME = d3.select("#counts")
				.append("svg")
					.attr("height", FRAME_HEIGHT)
					.attr("width", FRAME_WIDTH)
					.attr("class", "frame");


//scale for x the axis of length scatterplot
const SEPAL_LENGTH_SCALE = d3.scaleLinear()
						.domain([0, 8])
						.range([0, VIS_WIDTH]);

//scale for y the axis of length scatterplot
//reversed for y axis scaling
const PETAL_LENGTH_SCALE = d3.scaleLinear()
						.domain([0, 7.2]) 
						.range([VIS_HEIGHT, 0]);


//scale for x axis of the width scatterplot
const SEPAL_WIDTH_SCALE = d3.scaleLinear()
						.domain([0, 5])
						.range([0, VIS_WIDTH]);

//scale for y axis of the width scatterplot
//reverse again for y axis
const PETAL_WIDTH_SCALE = d3.scaleLinear()
						.domain([0, 3.2]) 
						.range([VIS_HEIGHT, 0]);


// Color scale: give me a species name, I return a color
const COLOR_SCALE = d3.scaleOrdinal()
    .domain(["setosa", "versicolor", "virginica" ])
    .range([SETOSA_COLOR, VERSICOLOR_COLOR, VIRGINICA_COLOR]);



//x scale for bar chart
const X_SCALE_BAR = d3.scaleBand()
  .domain(["setosa", "versicolor", "virginica"])
  .range([0, VIS_WIDTH])

//y scale for bar chart
const Y_SCALE_BAR = d3.scaleLinear()
		.domain([0, 63])
	    .range([0, VIS_HEIGHT]);

//inverted for y axis
const Y_AXIS_SCALE = d3.scaleLinear()
		.domain([0, 63])
	    .range([VIS_HEIGHT, 0]);

const BAR_WIDTH = VIS_WIDTH / 4

d3.csv("data/iris.csv").then((data) => {

    //ccount each species
    let setosa_count = 0;
    let versicolor_count = 0;
    let virginica_count = 0;

    for (d of data) {
        switch (d.Species) {
            case "setosa":
                setosa_count++;
                break;
            case "versicolor":
                versicolor_count++;
                break;
            case "virginica":
                virginica_count++;
                break;
        }
    }


	//appending length points 
	let lengthscatter = LENGTHFRAME.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
				.attr("cx", (d) => {return SEPAL_LENGTH_SCALE(d.Sepal_Length) + MARGINS.left;})
				.attr("cy", (d) => {return PETAL_LENGTH_SCALE(d.Petal_Length);})
				.attr("r", 5)
				.attr("class", "point")
				.attr("data-x", (d) => {return d.Sepal_Length;})
				.attr("data-y", (d) => {return d.Petal_Length;})
				.style("fill",  (d) => { return COLOR_SCALE(d.Species);})
				.style("opacity", 0.5);

	//appending x axis to length
	LENGTHFRAME.append("g")
			.attr("transform", "translate(" + MARGINS.left + "," + VIS_HEIGHT + ")")
			.call(d3.axisBottom(SEPAL_LENGTH_SCALE).ticks(9))
			.attr("font-size", "10px");

	//appending y axis
	LENGTHFRAME.append("g")
			.attr("transform", "translate(" + MARGINS.left + "," + 0 + ")")
			.call(d3.axisLeft(PETAL_LENGTH_SCALE).ticks(7))
			.attr("font-size", "10px");


	//appending width points 
	let widthscatter = WIDTHFRAME.selectAll("circle")
			.data(data)
			.enter()
			.append("circle")
				.attr("cx", (d) => {return SEPAL_WIDTH_SCALE(d.Sepal_Width) + MARGINS.left;})
				.attr("cy", (d) => {return PETAL_WIDTH_SCALE(d.Petal_Width);})
				.attr("r", 5)
				.attr("class", "point")
				.attr("data-x", (d) => {return d.Sepal_Width})
				.attr("data-y", (d) => {return d.Petal_Width})
				.style("fill",  (d) => {return COLOR_SCALE(d.Species)})
				.style("opacity", 0.5);
	
	//append x axis
	WIDTHFRAME.append("g")
			.attr("transform", "translate(" + MARGINS.left + "," + (VIS_HEIGHT) + ")")
			.call(d3.axisBottom(SEPAL_WIDTH_SCALE).ticks(9))
			.attr("font-size", "10px");

	//append y axis
	WIDTHFRAME.append("g")
			.attr("transform", "translate(" + MARGINS.left + "," + 0 + ")")
			.call(d3.axisLeft(PETAL_WIDTH_SCALE).ticks(7))
			.attr("font-size", "10px");


	//adding brushes
	WIDTHFRAME.call( d3.brush()                 
	      .extent([[0,0], [FRAME_WIDTH,FRAME_HEIGHT]])
	      .on("start brush", refreshChart)
	    )

        // checks if given coords are within the bounds of the box
	  function pointBrushed(brush_coords, cx, cy) {
        var x0 = brush_coords[0][0],
            y0 = brush_coords[0][1],
            x1 = brush_coords[1][0],
            y1 = brush_coords[1][1];
       return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;   
   }

   //checks if any corresponding point for given bar is selected
   function barBrushed(brush_coords, bar) {
    let anyPointBrushed = false;
    for (let n = 0; n < 150; n++) {
        point = data[n];
        if (pointBrushed(brush_coords, SEPAL_WIDTH_SCALE(point.Sepal_Width) + MARGINS.left, PETAL_WIDTH_SCALE(point.Petal_Width)) ) {
            anyPointBrushed = anyPointBrushed || (point.Species == bar.Species);
        }
    }
    return anyPointBrushed;
}

	  // refresh whole chart if brushing occured
	  function refreshChart() {
	    extent = d3.brushSelection(this);
	    lengthscatter.classed("selected", (d) => {
	    	return pointBrushed(extent, SEPAL_WIDTH_SCALE(d.Sepal_Width) + MARGINS.left, PETAL_WIDTH_SCALE(d.Petal_Width)); } );
	    widthscatter.classed("selected", (d) => {
	    	return pointBrushed(extent, SEPAL_WIDTH_SCALE(d.Sepal_Width) + MARGINS.left, PETAL_WIDTH_SCALE(d.Petal_Width)); } );
    	barPlot.classed("selected", (d) => {
	    		return barBrushed(extent, d);})
	  }

	  


      let barList = [{"Species": "setosa", "Count": setosa_count},
					{"Species": "versicolor", "Count": versicolor_count},
					{"Species": "virginica", "Count": virginica_count}];

	

    //Make bars for the graph
	let barPlot = BARFRAME.selectAll("rect")
					.data(barList)
					.enter()
					.append("rect")
					    .attr("x", (d) => {return X_SCALE_BAR(d.Species) + MARGINS.left*1.25;})
					    .attr("y", (d) => { return VIS_HEIGHT - Y_SCALE_BAR(d.Count);})
					    .attr("width", BAR_WIDTH)
					    .attr("height", (d) => { return Y_SCALE_BAR(d.Count); })
					    .attr("fill", (d) => {return COLOR_SCALE(d.Species);})
					    .attr("class", "bar")
					    .style("opacity", 0.5);


    //x axis for bar plot
    BARFRAME.append("g")
        .attr("transform", 
              "translate(" + MARGINS.left + "," + VIS_HEIGHT + ")")
        .call(d3.axisBottom(X_SCALE_BAR).ticks(7))
            .attr("font-size", "10px");




    //y axis for bar plot
    BARFRAME.append("g")
    	.attr("transform",
    			"translate(" + MARGINS.left + "," + "0" + ")")
    	.call(d3.axisLeft(Y_AXIS_SCALE).ticks(10))
            .attr("font-size", "10px");
			
});