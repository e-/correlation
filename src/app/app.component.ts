import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Generator } from './generator';
import { Scatterplot } from './visualization/scatterplot';
import { reform } from './util';
import { BarChart, SortedBarChart } from './visualization/barchart';
import { Sequence, Run } from './run';
import { Experimenter } from './experimenter';
import { Trial } from './trial';
import { ColorMap, SortedColorMap } from './visualization/colormap';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    host: {
        '(document:keyup)': 'handleKeyboardEvent($event)'
    }
})
export class AppComponent implements OnInit {
    @ViewChild('vis1') vis1: ElementRef;
    @ViewChild('vis2') vis2: ElementRef;

    title = 'app';

    runs: Run[];
    experimenter: Experimenter;

    numTrial = 0;
    generator = new Generator();

    trial: Trial;
    vis;

    constructor() {
    }

    ngOnInit() {
        this.runs = Sequence('three');

        this.experimenter = new Experimenter(this.runs);
    }

    go(type) {
        if(type === 'scatterplot')
            this.vis = Scatterplot;
        else if(type === 'stackedbar')
            this.vis = BarChart;
        else if(type === 'sortedbar')
            this.vis = SortedBarChart;
        else if(type === 'colormap')
            this.vis = ColorMap;
        else if(type === 'sortedcolormap')
            this.vis = SortedColorMap;

        console.log(this.vis)

        this.nextTrial();
    }

    nextTrial() {
        this.trial = this.experimenter.next();
        let trial = this.trial;

        let data1 = reform(this.generator.generate(trial.r1, 100))
        let data2 = reform(this.generator.generate(trial.r2, 100))

        this.empty(this.vis1.nativeElement);
        this.empty(this.vis2.nativeElement);

        this.vis(this.vis1.nativeElement, data1);
        this.vis(this.vis2.nativeElement, data2);
    }

    empty(element: HTMLDivElement) {
        element.querySelectorAll('*').forEach(d => d.remove());
    }

    handleKeyboardEvent(event: KeyboardEvent) {
        if (!this.trial) return;
        if (event.keyCode == 37) this.gradeTrial('L');
        else if (event.keyCode == 39) this.gradeTrial('R');
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
}


