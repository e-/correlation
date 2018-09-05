import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Generator } from './generator';
import { Scatterplot } from './visualization/scatterplot';
import { reform } from './util';
import { BarChart, SortedBarChart } from './visualization/barchart';
import { Sequence, Run } from './run';
import { Experimenter } from './experimenter';
import { Trial } from './trial';
import { ColorMap, SortedColorMap } from './visualization/colormap';
import { Visualization } from './visualization/visualization';
import { Point } from './types';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    host: {
        '(document:keydown)': 'handleKeyboardEvent($event)'
    }
})
export class AppComponent implements OnInit {
    @ViewChild('vis1') vis1: ElementRef;
    @ViewChild('vis2') vis2: ElementRef;

    title = 'app';

    runs: Run[];
    experimenter: Experimenter;

    distance =  80;
    visualAngle =  5;
    screenSizeInInches = 15;
    aspectRatioA = 16;
    aspectRatioB = 9;

    numTrial = 0;
    generator = new Generator();

    trial: Trial;
    vis: Visualization;
    useToggling = false;
    dataSize = 100;
    visibleDataIndex = 0;
    data1: Point[];
    data2: Point[];

    constructor() {
    }

    ngOnInit() {
        this.load();
        this.runs = Sequence('three');
        this.experimenter = new Experimenter(this.runs);
    }

    go(type:string, useToggling = false) {
        if(type === 'scatterplot')
            this.vis = new Scatterplot();
        else if(type === 'stackedbar')
            this.vis = new BarChart(useToggling);
        else if(type === 'sortedbar')
            this.vis = new SortedBarChart(useToggling);
        else if(type === 'colormap')
            this.vis = new ColorMap(useToggling);
        else if(type === 'sortedcolormap')
            this.vis = new SortedColorMap(useToggling);
            
        this.useToggling = useToggling;
        this.nextTrial();
    }

    nextTrial() {
        this.trial = this.experimenter.next();
        let trial = this.trial;

        this.data1 = reform(this.generator.generate(trial.r1, this.dataSize))
        this.data2 = reform(this.generator.generate(trial.r2, this.dataSize))
        this.visibleDataIndex = 0;

        this.render();
    }

    empty(element: HTMLDivElement) {
        Array.prototype.slice.call(element.querySelectorAll('*')).forEach(d => d.remove());
    }

    render() {
        this.empty(this.vis1.nativeElement);
        this.empty(this.vis2.nativeElement);

        this.vis.render(this.vis1.nativeElement, this.data1, this.unitSize, this.visibleDataIndex);
        this.vis.render(this.vis2.nativeElement, this.data2, this.unitSize, this.visibleDataIndex);
    }

    handleKeyboardEvent(event: KeyboardEvent) {
        if (!this.trial) return;
        if(!this.useToggling) {
            if (event.keyCode == 37) this.gradeTrial('L');
            else if (event.keyCode == 39) this.gradeTrial('R');
        }
        else {
            if(event.keyCode == 32) {
                this.visibleDataIndex = 1 - this.visibleDataIndex;
                this.render();
                event.preventDefault();
            }
            else if (event.keyCode == 37) this.gradeTrial('L');
            else if (event.keyCode == 39) this.gradeTrial('R');
        }
    }

    gradeTrial(choice: 'L' | 'R') {
        if (!this.trial) return;
        let trial = this.trial;
        this.trial = null;

        let done = this.experimenter.grade(trial, choice);

        if(done) {

        }
        else {
            this.nextTrial();
        }

        // if (data.fobs < 0.25 || m.count === data.maxTrials - 1) {
        //     showFeedback(m.ct.gotItRight, m.ct.correctChoice);
        //     disableInteraction();
        //     setTimeout(function () {
        //         hideFeedback();
        //         end();
        //     }, 1000);
        // } else {
        //     showFeedback(m.ct.gotItRight, m.ct.correctChoice);
        //     // remove feedback and begin next trial after a few seconds
        //     disableInteraction();
        //     setTimeout(function () {
        //         hideFeedback();
        //         m.count++;
        //         m.ct = {};
        //         enableInteraction();
        //         nextTrial();
        //     }, 1000);
        // }
    }

    save() {
        if(!window.localStorage) return;
        let ls = window.localStorage;

        if(this.distance) ls.setItem('distance', this.distance.toString());
        if(this.visualAngle) ls.setItem('visualAngle', this.visualAngle.toString());
        if(this.screenSizeInInches) ls.setItem('screenSizeInInches', this.screenSizeInInches.toString());
        if(this.aspectRatioA) ls.setItem('aspectRatioA', this.aspectRatioA.toString());
        if(this.aspectRatioB) ls.setItem('aspectRatioB', this.aspectRatioB.toString());
    }

    load() {
        if(!window.localStorage) return;
        let ls = window.localStorage;

        if(ls.getItem('distance')) this.distance = +ls.getItem('distance');
        if(ls.getItem('visualAngle')) this.visualAngle = +ls.getItem('visualAngle');
        if(ls.getItem('screenSizeInInches')) this.screenSizeInInches = +ls.getItem('screenSizeInInches');
        if(ls.getItem('aspectRatioA')) this.aspectRatioA = +ls.getItem('aspectRatioA');
        if(ls.getItem('aspectRatioB')) this.aspectRatioB = +ls.getItem('aspectRatioB');
    }

    get screenWidthInCm() {
        return this.screenSizeInInches * 2.54 * this.aspectRatioA /
            Math.sqrt(this.aspectRatioA * this.aspectRatioA + this.aspectRatioB * this.aspectRatioB);
    }

    get screenHeightInCm() {
        return this.screenSizeInInches * 2.54 * this.aspectRatioB /
            Math.sqrt(this.aspectRatioA * this.aspectRatioA + this.aspectRatioB * this.aspectRatioB);
    }

    get visWidthInCm() {
        return 2 * this.distance * Math.tan(this.visualAngle / 180 * Math.PI / 2)
    }

    get actualVisWidthInPixels() {
        return this.visWidthInCm / this.screenWidthInCm * window.screen.availWidth;
    }

    get unitSize() {
        let width = this.actualVisWidthInPixels;

        return Math.round(width / this.dataSize);
    }
}


