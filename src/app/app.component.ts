import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Generator } from './generator';
import { Scatterplot } from './visualization/scatterplot';
import { reform } from './util';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    @ViewChild('wrapper') wrapper:ElementRef;

    title = 'app';

    constructor() {
    }

    ngOnInit() {
        let generator = new Generator();
        console.log(generator.generate(0.5, 100));

        Scatterplot(this.wrapper.nativeElement, reform(generator.generate(0.99, 100)), 300);
    }
}
