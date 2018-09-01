import { Point } from "../types";
import { reform2, getStack, reform3, getPercentage } from "../util";
import * as d3 from 'd3';
import { colorOptions } from "../colors";

// BarChart requires dataset in the structure [[x1,x2,x3],[y1,y2,y3]]
// Reform dataset in this func
// Call reform3 in this file
// draw a x bar every 4 pixel and then a y bar
// 4 pixel because the extent is 400 while the size of dataset is 100
// 2 pixel of margin bewteen a pair (x, y)


export function BarChart(wrapper: HTMLDivElement, data2: Point[], extent = 300, stack:'stacked'|'regular'|'percentage'|'stem' = 'stacked',
                        order = 0, alpha = 0.9, margins = 20, offset = false, showLine = false) {
    let extentOverall = -1;

    extentOverall = extent + margins * 2;

    let width = extent,
        height = extent,
        margin = {
            top: margins,
            right: margins,
            bottom: margins,
            left: margins
        };

    let yDomain = height;

    // sort data according to x coordinates
    if (order) data2.sort(function (a, b) { return a[0] - b[0] })

    //input structure[[x1,y1],[x2,y2],[x3,y3]], output[[x1,x2,x3],[y1,y2,y3]]
    let data = reform3(data2);

    if (stack === 'stacked') {
        data = getStack(data);
        yDomain = d3.max(data[1]);
    } else if (stack === 'percentage') {
        data = getPercentage(data);
        yDomain = d3.max(data[1]);
    }
    let xScale = d3.scaleLinear().domain([0, width]).range([0, width])
    let yScale = d3.scaleLinear().domain([0, yDomain]).range([height, 0])

    let chart = d3.select(wrapper).append('svg:svg')
        .attr('width', extentOverall)
        .attr('height', extentOverall)
        .attr('class', 'chart');

    let main = chart.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'main');

    let n = data[0].length
        , xColor = colorOptions[3].A
        , yColor = colorOptions[3].B;

    let g = main.append('svg:g');

    // may change extent, so the step should be different
    // |    |     |
    // xbar y bar space
    let step = extent / n
        , barWidth = step / (!offset ? 1.0 : 2.0);

    // draw y bars first
    // add barWid / 2 to move center of bars to right
    g.selectAll('bars')
        .data(data[1])
        .enter().append("line")
        .attr('x1', function (d, i) { return i * step + barWidth / 2 + (!offset ? 0 : barWidth); })
        .attr('y1', function (d) { return (stack === 'stem' ? (height / 2) : yScale(0)); })
        .attr('x2', function (d, i) { return i * step + barWidth / 2 + (!offset ? 0 : barWidth); })
        .attr('y2', function (d) { return stack === 'stem' ? (height / 2 + d / 2) : yScale(d); })
        .attr('stroke', yColor)
        .attr('stroke-width', barWidth)
        .style('fill', yColor)
        .style('opacity', alpha);

    // draw x bars later because fm is lazy and don't want to compute coordinates
    // just let the x bars cover y bars
    g.selectAll('bars')
        .data(data[0])
        .enter().append("line")
        .attr('x1', function (d, i) { return i * step + barWidth / 2; })
        .attr('y1', function (d) { return stack === 'stem' ? (height / 2) : yScale(0); })
        .attr('x2', function (d, i) { return i * step + barWidth / 2; })
        .attr('y2', function (d) { return stack === 'stem' ? (height / 2 - d / 2) : yScale(d); })
        .attr('stroke', xColor)
        .attr('stroke-width', barWidth)
        .style('fill', xColor)
        .style('opacity', alpha);

    // draw the x axis
    let xAxis = d3.axisTop(xScale)
        .tickFormat(function (d) { return ''; })
        .tickSize(0)

    main.append('g')
        .attr('transform', 'translate(' + 0 + ',' + height + ')')
        .attr('class', 'main axis date').call(xAxis);

    if (showLine) {
        let linex = d3.line()
            .x(function (d, i) { return xScale(i * step); })
            .y(function (d, i) { return yScale(d); });

        let liney = d3.line()
            .x(function (d, i) { return xScale(i * step + (!offset ? 0 : barWidth)); })
            .y(function (d, i) { return yScale(d); });

        let gs = g.selectAll('lines')
            .data(data)
            .enter().append("path")
            .attr('d', function (d, i) { if (i === 0) { return linex(d, i); } else { return liney(d, i); } })
            .attr('stroke', function (d, i) { return i === 0 ? xColor : yColor; })
            .attr('stroke-size', barWidth)
            .attr('fill', 'none')
            .attr('opacity', alpha);
    }

    // draw the y axis
    let yAxis = d3.axisRight(yScale)
        .tickFormat(function (d) { return ''; })
        .tickSize(0)

    main.append('g')
        .attr('class', 'main axis date')
        .call(yAxis);

}
