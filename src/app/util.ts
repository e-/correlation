import { PointArray, Point } from "./types";
import * as science from "science";
import * as numbers from "numbers";

export let mean = numbers.statistic.mean;
export let sdc = numbers.statistic.standardDev;
export let corr = numbers.statistic.correlation;
export let max = numbers.basic.max;
export let min = numbers.basic.min;
export let sum = numbers.basic.sum;
export let gas: () => number = science.stats.distribution.gaussian();

export function reform(d: PointArray): Point[] {
    let array = [];
    for (let i = 0; i < d.X.length; i++) {
        array.push([d.X[i], d.Y[i]]);
    }
    return array;
}

export function reform2(d: Point[]): PointArray {
    let dict = { X: [], Y: [] };
    d.forEach(p => {
        dict.X.push(p[0]);
        dict.Y.push(p[1]);
    })

    return dict;
}

export function rot(d: Point[], dg, ws): Point[] {
    let n = d.length,
        dnew = [],
        radians = dg * (Math.PI / 180),
        negative = 1

    if (ws == 'counterclockwise')
        negative = -1

    for (let i = 0; i < n; i++) {
        // var rp = rotate([[d[i][0]],[d[i][1]]], dg, ws)
        // dnew.push([rp[0], rp[1]])
        // I don't know what's happenning here.
        // I made these work and then I broke them and cannot fix within several hours...
        // I have to use my own codes...
        let x = d[i][0] * Math.cos(radians) + negative * d[i][1] * Math.sin(radians),
            y = negative * (-1) * d[i][0] * Math.sin(radians) + d[i][1] * Math.cos(radians)

        dnew.push([x, y])
    }

    return dnew;
}

// set a box
// notice that this will break mean and sd
// set params.factor will break w and h
export function setBox(d: Point[], w = -1, h = -1, f = -1) {
    //first rotate all points
    let n = d.length,
        dnew = rot(d, 45, 'counterclockwise'),
        arrin2 = reform2(dnew)

    let xmean = mean(arrin2.X),
        ymean = mean(arrin2.Y),
        xmax = max(arrin2.X),
        xmin = min(arrin2.X),
        ymax = max(arrin2.Y),
        ymin = min(arrin2.Y),
        dresult = []

    if (f != -1) {
        w = f * (xmax - xmin)
        h = f * (ymax - ymin)
    }

    //rescale all x and y
    for (var i = 0; i < n; i++) {
        var x = w / 2 * (dnew[i][0] - xmean) / ((xmax - xmin) / 2) + xmean
            , y = h / 2 * (dnew[i][1] - ymean) / ((ymax - ymin) / 2) + ymean
        dresult.push([x, y])
    }

    //rotate back
    return rot(dresult, 45, 'clockwise')
}

export function getBox(d: Point[]) {
    let arrin2 = reform2(d),
        xmin = min(arrin2.X),
        ymin = min(arrin2.Y),
        xmax = max(arrin2.X),
        ymax = max(arrin2.Y),
        rb = rot([[xmin, ymin], [xmin, ymax], [xmax, ymax], [xmax, ymin]], 45, 'clockwise');

    let box = {
        "one": { "x1": rb[0][0], "y1": rb[0][1], "x2": rb[1][0], "y2": rb[1][1] },
        "two": { "x1": rb[1][0], "y1": rb[1][1], "x2": rb[2][0], "y2": rb[2][1] },
        "three": { "x1": rb[2][0], "y1": rb[2][1], "x2": rb[3][0], "y2": rb[3][1] },
        "four": { "x1": rb[3][0], "y1": rb[3][1], "x2": rb[0][0], "y2": rb[0][1] },
        "width": xmax - xmin,
        "height": ymax - ymin,
        "ratio": (xmax - xmin) / (ymax - ymin)
    };

    return box;
}
