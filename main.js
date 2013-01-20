var margin = {top: 10, right: 10, bottom: 100, left: 40};
var margin2 = {top: 560, right: 10, bottom: 20, left: 40};

var w = 1024;
var h = 640;

var width = w - margin.left - margin.right;
var height = h - margin.top - margin.bottom;
var height2 = h - margin2.top - margin2.bottom;

var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([0, height]);

var x2 = d3.time.scale().range([0, width]);
var y2 = d3.scale.linear().range([0, height2]);

var xAxis = d3.svg.axis().scale(x).orient("bottom");
var yAxis = d3.svg.axis().scale(y).orient("left");

var xAxis2 = d3.svg.axis().scale(x2).orient("bottom");

var brush = d3.svg.brush()
  .x(x2)
  .on("brush", brush);

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

svg.append("defs").append("clipPath")
  .attr("id", "clip")
  .append("rect")
  .attr("width", width)
  .attr("height", height);

var focus = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var context = svg.append("g")
  .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

var gradient = svg.append("defs")
  .append("linearGradient")
  .attr("id", "gradient")
  .attr("x1", "0%")
  .attr("y1", "0%")
  .attr("x2", "0%")
  .attr("y2", "100%")
  .attr("spreadMethod", "pad");

gradient.append("svg:stop")
  .attr("offset", "0%")
  .attr("stop-color", "#805c7d")
  .attr("stop-opacity", 1);

gradient.append("svg:stop")
    .attr("offset", "100%")
    .attr("stop-color", "#563e53")
    .attr("stop-opacity", 1);

d3.csv("yesterday.csv", function(error, csv) {
  var data = d3.nest()
    .key(function(d) { return d["Application"]; })
    .sortKeys(d3.ascending)
    .entries(csv);

  data.forEach(function(app) {
    app.values.forEach(function(values) {
      values.foreground_begin = new Date(values["Foreground Begin (Unix Time)"] * 1000);
      values.foreground_end = new Date(values["Foreground End (Unix Time)"] * 1000);
    });
  });

  x.domain([
    d3.min(data, function(d) {
      return d3.min(d.values, function(v) {
        return v.foreground_begin;
      });
    }),
    d3.max(data, function(d) {
      return d3.max(d.values, function(v) {
        return v.foreground_end;
      });
    })
  ]);
  x2.domain(x.domain());

  y.domain([0, data.length]);
  y2.domain(y.domain());

  focus.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  var number_of_apps = data.length;
  var rect_height = height / number_of_apps;

  var apps = focus.selectAll(".app")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "app")
    .attr("transform", function(d, i) { return "translate(0, " + (height - rect_height - y(i)) + ")"; });

  apps.selectAll("rect")
    .data(function(d) { return d.values; })
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.foreground_begin); })
    .attr("height", rect_height)
    .attr("width", function(d) { return x(d.foreground_end) - x(d.foreground_begin); })
    .attr("clip-path", "url(#clip)")
    .style("fill", "url(#gradient)");

  context.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, " + height2 + ")")
    .call(xAxis2);

  rect_height = height2 / number_of_apps;

  var apps2 = context.selectAll(".app")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "app")
    .attr("transform", function(d, i) { return "translate(0, " + (height2 - rect_height - y2(i)) + ")"; });

  apps2.selectAll("rect")
    .data(function(d) { return d.values; })
    .enter()
    .append("rect")
    .attr("x", function(d) { return x2(d.foreground_begin); })
    .attr("height", rect_height)
    .attr("width", function(d) { return x2(d.foreground_end) - x2(d.foreground_begin); })
    .style("fill", "url(#gradient)");

  context.append("g")
    .attr("class", "x brush")
    .call(brush)
    .selectAll("rect")
    .attr("y", 0)
    .attr("height", height2);
});

function brush() {
  x.domain(brush.empty() ? x2.domain() : brush.extent());

  focus.select(".x.axis").call(xAxis);

  focus.selectAll(".app rect")
    .attr("x", function(d) { return x(d.foreground_begin); })
    .attr("width", function(d) { return x(d.foreground_end) - x(d.foreground_begin); });
}