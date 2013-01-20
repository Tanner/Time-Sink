var margin = {top: 10, right: 10, bottom: 100, left: 40};
var width = 960 - margin.left - margin.right;
var height = 500 - margin.top - margin.bottom;

var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([0, height]);

var xAxis = d3.svg.axis().scale(x).orient("bottom");
var yAxis = d3.svg.axis().scale(y).orient("left");

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

var focus = svg.append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("yesterday.csv", function(error, csv) {
  var data = d3.nest()
    .key(function(d) { return d["Application"]; })
    .sortKeys(d3.ascending)
    .entries(csv);

  console.log(data);

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
      return d3.min(d.values, function(v) {
        return v.foreground_end;
      });
    })
  ]);

  y.domain([0, data.length]);

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
    .attr("transform", function(d, i) { return "translate(0, " + (height - y(i)) + ")"; });

  apps.selectAll("rect")
    .data(function(d) { return d.values; })
    .enter()
    .append("rect")
    .attr("x", function(d) { return x(d.foreground_begin); })
    .attr("height", rect_height)
    .attr("width", function(d) { return x(d.foreground_end) - x(d.foreground_begin); });
});