// @TODO: YOUR CODE HERE!
const svgWidth = 960;
const svgHeight = 500;

const margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;
// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
const svg = d3
  .select(".scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
const chartGroup = svg.append("g")
.attr("transform", `translate(${margin.left}, ${margin.top})`);

 // Initial Params
  let chosenXAxis = "poverty";
  let chosenYAxis="healthcare";

// function used for updating xScale upon click on axis label
function xScale (dataJournalism , chosenXAxis ){
     // create scale
     const xLinearScale = d3.scaleLinear()
        .domain([d3.min(dataJournalism, d => d[chosenXAxis]) * 0.8,
        d3.max(dataJournalism, d => d[chosenXAxis]) * 1.2
     ])
        .range([0, width]);
 
   return xLinearScale;
 
 }
// function used for updating yScale upon click on axis label 
function yScale (dataJournalism , chosenXAxis ){
  // create scale
  const yLinearScale = d3.scaleLinear()
     .domain([d3.min(dataJournalism, d => d[chosenYAxis]) * 0.8,
     d3.max(dataJournalism, d => d[chosenXAxis]) * 1.2
  ])
     .range([height,0]);

return yLinearScale;

}

// function used for updating xAxis upon click on axis label 
function renderAxes(newXScale, xAxis) {
    const bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}
// function used for updating yAxis upon click on axis label 
function renderAxes(newXScale, yAxis) {
  const leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}


// function used for updating circles group with a transition to new circles
function renderCircles(circlesGroup, newXScale,chosenXaxis,newYscale, chosenYaxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYscale(d[chosenYAxis]))
  
    return circlesGroup;
  }

  // function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {
    let label = '';
    //xLable
    if (chosenXAxis === "poverty") {
      label = "In Poverty (%)";
    }
    if (chosenXAxis === "Age") {
        label = "Age (Median)";
    }
    else {
      label = "Household Income (Median)";
    }

    //yLable
    if (chosenYAxis === "healthcare") {
      label = "Lacks Healthcare (%)";
    }
    if (chosenXAxis === "smokes") {
        label = "Smokes (%)";
    }
    else {
      label = "Obese (%)";
    }
  // create tooltip

    const toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.poverty}<br>${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}
 
//Import Data from CSV file 
d3.csv("assets/data/data.csv").then(dataJournalism => {
    console.log(dataJournalism);

     // Step 1: Parse Data/Cast as numbers
    // ==============================

    dataJournalism.forEach(data => {
       
        data.poverty = +data.poverty
        data.povertyMoe = +data.povertyMoe
        data.age = +data.age
        data.ageMoe = +data.ageMoe
        data.healthcare = +data.healthcare
        data.healthcareLow= +data.healthcareLow
        data.healthcareHigh = +data.healthcareHigh
        data.smokes = + data.smokes
        data.smokesLow = +data.smokesLow
        data.smokesHigh = +data.smokesHigh
        
    });


    // xLinearScale function above csv import
    let xLinearScale = xScale(dataJournalism, chosenXAxis);
    let yLinearScale = yScale(dataJournalism, chosenYAxis);

    // Create initial axis functions
    const bottomAxis = d3.axisBottom(xLinearScale);
    const leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    chartGroup.append("g")
        .call(leftAxis);

    

    // Create Circles
    // ==============================
    const circlesGroup = chartGroup.selectAll("circle")
        .data(dataJournalism)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy" , d => yLinearScale(d[chosenYAxis]))
        .attr("r",20)
        .attr("fill","blue")
        .attr("opacity",".5");

    // Create group for  2 x- axis labels
    const labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    const dataLengthLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "povert") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    const ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "healthcare") // value to grab for event listener
    .classed("inactive", true)
    .text("# Age(Median)");

    // append y axis
    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare(%)");

    // updateToolTip function above csv import
    circlesGroup = updateToolTip(chosenXAxis, circlesGroup);



    // x axis labels event listener
    labelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
    const value = d3.select(this).attr("value");
    if (value !== chosenXAxis) {

        // replaces chosenXaxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(dataJournalism, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "age") {
        ageLabel
            .classed("active", true)
            .classed("inactive", false);
        dataLengthLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
        ageLabel
            .classed("active", false)
            .classed("inactive", true);
        dataLengthLabel
            .classed("active", true)
            .classed("inactive", false);
        }
    }
  });


}).catch(function(error) {
console.log(error);
});









