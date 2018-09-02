import { Point } from "../types";
import { reform2, getStack, reform3, getPercentage, translate } from "../util";
import * as d3 from 'd3';
import { colorOptions } from "../colors";

export function SortedColorMap(wrapper: HTMLDivElement, data2: Point[], extent = 600) {
    ColorMap(wrapper, data2, extent, 1);
}

export function ColorMap(wrapper: HTMLDivElement, data2: Point[], extent = 600, order = 0, margins = 20) {
    let extentOverall = -1;

    extentOverall = extent + margins * 2;
    let size = extent / data2.length;

    let width = size * 2,
        height = extent,
        margin = {
            top: margins,
            right: 0,
            bottom: margins,
            left: 0
        };

    let yDomain = height;

    // sort data according to x coordinates
    if (order) data2.sort(function (a, b) { return a[0] - b[0] })

    //input structure[[x1,y1],[x2,y2],[x3,y3]], output[[x1,x2,x3],[y1,y2,y3]]
    let data = reform3(data2);

    let chart = d3.select(wrapper)
        .append('svg:svg')
        .attr('width', width)
        .attr('height', extentOverall)
        .attr('class', 'chart');

    let scale = d3.scaleSequential(d3.interpolateBlues).domain([0, 300]);

    let main = chart.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'main');

    let n = data[0].length
    let g = main.append('svg:g');

    g
        .selectAll('g')
        .data(data)
        .enter()
            .append('g')
            .attr('transform', (d, i) => translate(i * size, 0))
            .selectAll('rect')
            .data((d) => d)
            .enter()
                .append('rect')
                .attr('width', size)
                .attr('height', size)
                .attr('transform', (d, i) => translate(0, i * size))
                .attr('fill', (d, i) => scale(d))
}
