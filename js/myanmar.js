// Default slider values
var POP_MIN = 2850;
var POP_MAX = 1487110;
var ELEC_MIN = 0;
var ELEC_MAX = 100.0;
var WORK_MIN = 56.3;
var WORK_MAX = 89.1;
var EDU_MIN = 0;
var EDU_MAX = 38;
var DEP_MIN = 24.5;
var DEP_MAX = 94;
var CELL_MIN = 0;
var CELL_MAX = 95.4;
var SOL_MIN = 0;
var SOL_MAX = 70.7;

// Frame
var width = 780,
    height = 1200,
    center = [width / 2, height / 2];

// Projection
var projection = d3.geo.mercator()
    .scale(3000)
    .center([97, 19])
    .translate([width / 2, height / 2]);

// Path
var path = d3.geo.path()
    .projection(projection);

// Zoom
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 100])
    .on('zoom', zoomFn);

// Sliders
var elecSlider = d3.slider()
    .value([ ELEC_MIN, ELEC_MAX ])
    .on('slide', elecBrushed);
var popSlider = d3.slider()
    .min(POP_MIN)
    .max(POP_MAX)
    .value([ POP_MIN, POP_MAX ])
    .on('slide', popBrushed);

var workSlider = d3.slider()
  .value([ WORK_MIN, WORK_MAX ])
  .on('slide', workBrushed);
var eduSlider = d3.slider()
  .value([ EDU_MIN, EDU_MAX ])
  .on('slide', eduBrushed);
var depSlider = d3.slider()
  .value([ DEP_MIN, DEP_MAX ])
  .on('slide', depBrushed);

var cellSlider = d3.slider()
  .value([ CELL_MIN, CELL_MAX ])
  .on('slide', cellBrushed);
var solSlider = d3.slider()
  .value([ SOL_MIN, SOL_MAX ])
  .on('slide', solBrushed);

// SVG
var svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height);

// Zoom layer
var g = svg.append('g');

// Map layer
var mapLayer = g.append('g')
    .classed('map-layer', true);

var roadLayer = g.append('g')
    .classed('road-layer', true);

var hvLayer = g.append('g')
    .classed('hv-layer', true);

var mvLayer = g.append('g')
    .classed('mv-layer', true);

// Make info div invisible
var info = d3.select('#info')
    .attr('class', 'info')
    .style('opacity', 0);

// Attach zoom to SVG
svg.call(zoom)
    .call(zoom.event);

// Roads layer
d3.json('data/roads.geojson', function(error, roadData) {
    var roadFeatures = roadData.features;

    roadLayer.selectAll('path')
        .data(roadFeatures)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('vector-effect', 'non-scaling-stroke');
});

// Set initial roadLayer visibility
var roads_checkbox = d3.select('#roads_checkbox');
roadLayer.attr('visibility', roads_visible());

// Toggle roadLayer on/off
var roads_toggle = roads_checkbox.on('click', function() {
    roadLayer.attr('visibility', roads_visible());
});

function roads_visible() {
    return roads_checkbox.property('checked') ? 'visible' : 'hidden';
}

// High-voltage lines layer
d3.json('data/high_voltage.geojson', function(error, hvData) {
    var hvFeatures = hvData.features;

    hvLayer.selectAll('path')
        .data(hvFeatures)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('vector-effect', 'non-scaling-stroke');
});

// Medium-voltage lines layer
d3.json('data/medium_voltage.geojson', function(error, mvData) {
    var mvFeatures = mvData.features;

    mvLayer.selectAll('path')
        .data(mvFeatures)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('vector-effect', 'non-scaling-stroke');
});

// Set initial hvLayer and mvLayer visibility
var lines_checkbox = d3.select('#lines_checkbox');
hvLayer.attr('visibility', lines_visible());
mvLayer.attr('visibility', lines_visible())

// Toggle roadLayer on/off
var lines_toggle = lines_checkbox.on('click', function() {
    hvLayer.attr('visibility', lines_visible());
    mvLayer.attr('visibility', lines_visible());
});

function lines_visible() {
    return lines_checkbox.property('checked') ? 'visible' : 'hidden';
}

// Load map
d3.json('data/myanmar.geojson', mapFn);

// Draw map
function mapFn(error, mapData) {
    var features = mapData.features;

    // Sliders
    d3.select('#pop')
        .call(popSlider);
    d3.select('#elec')
        .call(elecSlider);
    d3.select('#work')
        .call(workSlider);
    d3.select('#edu')
        .call(eduSlider);
    d3.select('#dep')
        .call(depSlider);
    d3.select('#cell')
        .call(cellSlider);
    d3.select('#sol')
        .call(solSlider);

    // Bind to paths
    mapLayer.selectAll('path')
        .data(features)
        .enter()
        .append('path')
        .attr('id', function(d) { return d.properties.TS_PCODE; })
        .attr('d', path)
        .attr('vector-effect', 'non-scaling-stroke')
        .attr('fill', '#bbbbbb')
        .attr('opacity', 0.5)
        .attr('stroke', '#ffffff')
        .classed('highlight', function(d) { return townshipDisplay(d); })
        .on('mouseover', function(d) {
            d3.select(this)
                .classed('selected', true);

            // Make info box visible
            info.transition()
                .duration(100)
                .style('opacity', 1);

            // Set info box position
            if(d3.event.pageX > (width - 200)) {
                info.style('left', (d3.event.pageX - 210) + 'px');
            } else {
                info.style('left', (d3.event.pageX + 20) + 'px')
                    .style('top', (d3.event.pageY - 30) + 'px');
            }

            if(d3.event.pageY > (height - 150)) {
                info.style('top', (d3.event.pageY - 140) + 'px');
            } else {
                info.style('top', (d3.event.pageY - 30) + 'px');
            }

            // Update info box information
            info.select('.name')
                .text(d.properties.ST + ' > ' + d.properties.DT + ' > ' + d.properties.TS);

            info.select('.info_pop_val.val')
                .text((d.properties.Total * 10).toFixed(0));
            info.select('.info_elec_val.val')
                .text((d.properties.Prop_Electricity * 100).toFixed(1) + '%');
            info.select('.info_work_val.val')
                .text((d.properties.age_above_15 * 100).toFixed(1) + '%');
            info.select('.info_edu_val.val')
                .text((100 - d.properties.below_medium_education * 100).toFixed(1) + '%');
            info.select('.info_dep_val.val')
                .text((d.properties.total_dep_ratio * 100).toFixed(1) + '%');
            info.select('.info_cell_val.val')
                .text((d.properties.has_mobile_conv * 100).toFixed(1) + '%');
            info.select('.info_sol_val.val')
                .text((d.properties.Prop_Solar_System_Energy * 100).toFixed(1) + '%');
        })
        .on('mouseout', function() {
            d3.select(this)
                .classed('selected', false);

            // Make info box invisible
            info.transition()
                .duration(300)
                .style('opacity', 0);
        });
}

function zoomFn() {
    g.attr('transform', 'translate(' + zoom.translate() + ')' + 'scale(' + zoom.scale() + ')');
}

// Slider functions

function townshipDisplay(d) {
    pop = d.properties.Total * 10;
    elec = d.properties.Prop_Electricity * 100;
    work = d.properties.age_above_15 * 100;
    edu = 100 * (1 - d.properties.below_medium_education);
    dep = d.properties.total_dep_ratio * 100;
    cell = d.properties.has_mobile_conv * 100;
    sol = d.properties.Prop_Solar_System_Energy * 100;

    show = (pop <= POP_MAX && pop >= POP_MIN &&
            elec <= ELEC_MAX && elec >= ELEC_MIN &&
            work <= WORK_MAX && work >= WORK_MIN &&
            edu <= EDU_MAX && edu >= EDU_MIN &&
            dep <= DEP_MAX && dep >= DEP_MIN &&
            cell <= CELL_MAX && cell >= CELL_MIN &&
            sol <= SOL_MAX && sol >= SOL_MIN);

    return show;
}

function popBrushed(evt, value) {
    d3.select('#poptextmin')
        .text(value[0].toFixed(0));
    d3.select('#poptextmax')
        .text(value[1].toFixed(0));

    POP_MIN = value[0];
    POP_MAX = value[1];

    mapLayer.selectAll('path')
        .classed('highlight', function(d) { return townshipDisplay(d); });
}

function elecBrushed(evt, value) {
    d3.select('#electextmin')
        .text(value[0].toFixed(1));
    d3.select('#electextmax')
        .text(value[1].toFixed(1));

    ELEC_MIN = value[0];
    ELEC_MAX = value[1];

    mapLayer.selectAll('path')
        .classed('highlight', function(d) { return townshipDisplay(d); });
}

function workBrushed(evt, value) {
    d3.select('#worktextmin')
        .text(value[0].toFixed(1));
    d3.select('#worktextmax')
        .text(value[1].toFixed(1));

    WORK_MIN = value[0];
    WORK_MAX = value[1];

    mapLayer.selectAll('path')
        .classed('highlight', function(d) { return townshipDisplay(d); });
}

function eduBrushed(evt, value) {
    d3.select('#edutextmin')
        .text(value[0].toFixed(1));
    d3.select('#edutextmax')
        .text(value[1].toFixed(1));

    EDU_MIN = value[0];
    EDU_MAX = value[1];

    mapLayer.selectAll('path')
        .classed('highlight', function(d) { return townshipDisplay(d); });
}

function depBrushed(evt, value) {
    d3.select('#deptextmin')
        .text(value[0].toFixed(1));
    d3.select('#deptextmax')
        .text(value[1].toFixed(1));

    DEP_MIN = value[0];
    DEP_MAX = value[1];

    mapLayer.selectAll('path')
        .classed('highlight', function(d) { return townshipDisplay(d); });
}

function cellBrushed(evt, value) {
    d3.select('#celltextmin')
        .text(value[0].toFixed(1));
    d3.select('#celltextmax')
        .text(value[1].toFixed(1));

    CELL_MIN = value[0];
    CELL_MAX = value[1];

    mapLayer.selectAll('path')
        .classed('highlight', function(d) { return townshipDisplay(d); });
}

function solBrushed(evt, value) {
    d3.select('#soltextmin')
        .text(value[0].toFixed(1));
    d3.select('#soltextmax')
        .text(value[1].toFixed(1));

    SOL_MIN = value[0];
    SOL_MAX = value[1];

    mapLayer.selectAll('path')
        .classed('highlight', function(d) { return townshipDisplay(d); });
}
