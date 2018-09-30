import * as d3 from 'd3';
import { Point } from '../types';
import { setBox, rot, getBox } from '../util';
import { Visualization } from './visualization';

export class Scatterplot implements Visualization {
    name = 'scatterplot';

    constructor(public useToggling,
        public showBox = false, public pSize = 1.5, public margins = 20, public factor = 1, public showLine = false) {

    }

    render(wrapper: HTMLDivElement, data: Point[], unitSize: number, dataIndex: number) {
        let count = data.length;
        let extentOverall = unitSize * count + this.margins * 2,
            boxData = [];


        let width = unitSize * count,
            height = unitSize * count,
            margin = {
                top: this.margins,
                right: this.margins,
                bottom: this.margins,
                left: this.margins
            };

        let x = d3.scaleLinear().domain([0, width]).range([0, width]);
        let y = d3.scaleLinear().domain([0, height]).range([height, 0]);

        let chart = d3.select(wrapper).append('svg:svg')
            .attr('width', extentOverall)
            .attr('height', extentOverall)
            .attr('class', 'chart')

        let main = chart.append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr('width', width).attr('height', height).attr('class', 'main')

        // draw the x axis
        let xAxis = d3.axisTop(x)
            .tickFormat(function (d) { return ''; })
            .tickSize(0)

        main.append('g')
            .attr('transform', 'translate(' + 0 + ',' + height + ')')
            .attr('class', 'main axis date').call(xAxis);

        // draw the y axis
        let yAxis = d3.axisRight(y)
            .tickFormat(function (d) { return ''; })
            .tickSize(0)

        main.append('g')
            .attr('class', 'main axis date').call(yAxis);

        let g = main.append("svg:g");

        g.selectAll('div').data(data).enter().append("svg:circle")
            .attr("cx", function (d) { return x(d[0]); })
            .attr("cy", function (d) { return y(d[1]); })
            .attr("r", this.pSize);

        if (this.showLine) {
            data.sort(function (a, b) { return a[0] - b[0] });

            var line = d3.line()
                .x(function (d) { return x(d[0]); })
                .y(function (d) { return y(d[1]); });

            var gs = g.append("path")
                .datum(data)
                .attr('d', line)
                .attr('stroke', 'black')
                .attr('stroke-size', 1)
                .attr('fill', 'none')
        }

        let box = getBox(rot(data, 45, 'counterclockwise'))

        return box;
    }

}
