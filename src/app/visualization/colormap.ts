import { Point } from "../types";
import { reform2, getStack, reform3, getPercentage, translate } from "../util";
import * as d3 from 'd3';
import { colorOptions } from "../colors";
import { Visualization } from "./visualization";
import { Color } from "d3";

export class ColorMap implements Visualization {
    name = 'colormap';

    constructor(public useToggling, public order = 0, public margins = 20) {

    }

    render(wrapper: HTMLDivElement, data2: Point[], unitSize: number, dataIndex: number) {
        let n = data2.length;

        let width = unitSize * n,
            height = unitSize * n,
            margin = {
                top: this.margins,
                right: 0,
                bottom: this.margins,
                left: 0
            };

        let yDomain = height;

        // sort data according to x coordinates
        if (this.order) data2.sort(function (a, b) { return a[0] - b[0] })

        //input structure[[x1,y1],[x2,y2],[x3,y3]], output[[x1,x2,x3],[y1,y2,y3]]
        let data = reform3(data2);

        let barWidth = width / (this.useToggling ? 1 : 2);
        let barHeight = unitSize;

        let chart = d3.select(wrapper)
            .append('svg:svg')
            .attr('width', width)
            .attr('height', height + this.margins * 2)
            .attr('class', 'chart');

        let scale = d3.scaleLinear<Color>()
        .range([d3.rgb(colorOptions[0][0][0]), d3.rgb(colorOptions[0][0][1])])
        .domain([0, width]);

        let main = chart.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'main');

        let g = main.append('svg:g');

        g
            .selectAll('g')
            .data(this.useToggling ? [data[dataIndex]] : data)
            .enter()
            .append('g')
            .attr('transform', (d, i) => translate(barWidth * i, 0))
            .selectAll('rect')
            .data((d) => d)
            .enter()
            .append('rect')
            .attr('width', barWidth)
            .attr('height', barHeight)
            .attr('transform', (d, i) => translate(0, i * barHeight))
            .attr('fill', (d, i) => scale(d).toString())
    }

}

export class SortedColorMap extends ColorMap {
    constructor(public useToggling, public order = 1, public margins = 20) {
        super(useToggling, order, margins);
    }
}
