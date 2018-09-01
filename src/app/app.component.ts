import { Component } from '@angular/core';
import { Generator } from './generator';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'app';

    constructor() {
        let generator = new Generator();
        console.log(generator.generate(0.5, 100));
    }
}
