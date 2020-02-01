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

    var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${style(d[chosenXAxis], chosenXAxis)}<br>`);
    });

    circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
    })
    // onmouseout event
    .on("mouseout", function(data) {
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
    //======================================================================================================
    // append x axis
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    let yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);
    
    // Create initial Circles=================================================================================================
   
    var circlesGroup = chartGroup.selectAll("circle")
        .data(dataJournalism)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy" , d => yLinearScale(d[chosenYAxis]))
        .attr("r",20)
        .attr("fill","blue")
        .attr("opacity",".5");

    // Create group for  3 x- axis labels==============================================
    const xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    const povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "povert") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");

    const ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age(Median)");

    const incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Houshold Income (Median)");

     // Create group for  3 y- axis labels==============================================
     const ylabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${margin.left / 2}, ${height})`);

    const healthLabel = ylabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", -20)
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .attr('transform', 'rotate(-90)')
        .text("Lacks Healthcare (%)");

    const smokeLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y",- 40)
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .attr('transform', 'rotate(-90)')
    .text("Smokes (%)");

    const obesityLabel = ylabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", -60)
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .attr('transform', 'rotate(-90)')
    .text("Obese (%)");
   
    // updateToolTip function above csv import======================================================================================
    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);



    // x axis labels event listener=========================================================================================================
    xlabelsGroup.selectAll("text")
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
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale,chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis,chosenYAxis,circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
        povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        ageLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
        ageLabel
            .classed("active", true)
            .classed("inactive", false);
        povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }

        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
    // y axis labels event listener=========================================================================================================
    ylabelsGroup.selectAll("text")
    .on("click", function() {
    // get value of selection
    const value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

        // replaces chosenXaxis with value
        chosenYAxis = value;
        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(dataJournalism, chosenYAxis);

        // updates x axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale,chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenyAxis,chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenyAxis === "obesity") {
        obesityLabel
            .classed("active", true)
            .classed("inactive", false);
        smokeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenyAxis === "smokes") {
        smokeLabel
            .classed("active", true)
            .classed("inactive", false);
        obesityLabel
            .classed("active", false)
            .classed("inactive", true);
        }

        else {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokeLabel
            .classed("active", false)
            .classed("inactive", true);
          healthLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });


}).catch(function(error) {
console.log(error);
});









