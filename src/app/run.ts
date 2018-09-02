import { shuffle } from "./util";

export class Run {
    delta:number;

    constructor(public rbase, public dir: 1 | -1, public startDelta = .1,
        public deltaRight = .01, public deltaWrong = .03, public maxTrials = 50) {
        this.delta = startDelta;

    }
}

type SequenceName = 'three' | 'four' | 'one' | 'five' | 'threefour' | 'fiveseven';

export function Sequence(name: SequenceName) {
    let runs: Run[];

    if (name === 'three')
        runs = [new Run(.6, 1), new Run(.6, -1), new Run(.3, 1), new Run(.3, -1)]
    else if (name === 'five')
        runs = [new Run(.8, 1), new Run(.8, -1), new Run(.5, 1), new Run(.5, -1)]
    else if (name === 'four')
        runs = [new Run(.7, 1), new Run(.7, -1), new Run(.4, 1), new Run(.4, -1)]
    // special cases
    else if (name === 'one')
        runs = [new Run(.2, 1), new Run(.2, -1), new Run(.1, 1), new Run(.1, -1)]
    else if (name === 'threefour')
        runs = [new Run(.4, 1), new Run(.4, -1), new Run(.3, 1), new Run(.3, -1)]
    else if (name === 'fiveseven')
        runs = [new Run(.7, 1), new Run(.7, -1), new Run(.5, 1), new Run(.5, -1)]

    shuffle(runs);

    return runs;
}

