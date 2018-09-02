import { Point, PointArray } from "./types";
import { corr, gas, mean, sdc } from "./util";

/*
    Original Source Code: https://github.com/TuftsVALT/ranking-correlation/blob/master/experiment/public/modules/JND/trials.html
*/

export class Generator {
    constructor() {
    }

    generate(r: number, n: number, extent = 300, martio = 0.5, sdratio = 0.2) {
        console.log("r input is " + r);

        let rsign = r;       // record the raw r
        r = Math.abs(r) // in case for accident
        let flag = 0,
            k: PointArray;

        do {
            k = this.generatePoints(n);
            k = this.standardize(k);
            k = this.adjust(k, r);
            k = this.standardize(k);
            k = this.scale(k, extent, martio, sdratio);
            flag = this.check(k, extent);
        } while (flag == -1)

        if (rsign < 0)
            for (var i in k.Y)
                k.Y[i] = extent - k.Y[i]

        console.log("r output is " + corr(k.X, k.Y))
        return k
    }

    private nextGauss(): Point {
        let x = gas()

        while (x < -2 || x > 2) x = gas()

        let y = gas()
        while (y < -2 || y > 2) y = gas()

        return [x, y]
    }

    private generatePoints(n): PointArray {
        let xarr = [];
        let yarr = []

        for (let i = 0; i < n; i++) {
            let one = this.nextGauss();

            xarr.push(one[0])
            yarr.push(one[1])
        }

        return {
            "X": xarr,
            "Y": yarr
        }
    }

    private standardize(d: PointArray): PointArray {
        let mx = mean(d.X)
        let sdx = sdc(d.X)
        let my = mean(d.Y)
        let sdy = sdc(d.Y)
        let n = d.X.length;

        for (let i = 0; i < n; i++) {
            d.X[i] = (d.X[i] - mx) / sdx
            d.Y[i] = (d.Y[i] - my) / sdy
        }

        return d
    }

    private calculateLambda(d: PointArray, r: number): number {
        let rz = corr(d.X, d.Y), rz2 = Math.pow(rz, 2)
            , a = (2 * r * r - 2 * r * r * rz - 1 + 2 * rz - rz2)
            , b = (-2 * r * r + 2 * r * r * rz - 2 * rz + 2 * rz2)
            , c = (r * r - rz2)
        return (-1.0 * b - Math.sqrt(b * b - 4 * a * c)) / (2 * a)
    }

    private adjust(d: PointArray, r: number): PointArray {
        let l = this.calculateLambda(d, r);
        let n = d.X.length;

        for (let i = 0; i < n; i++) {
            d.Y[i] =
                (l * d.X[i] + (1 - l) * d.Y[i])
                / Math.sqrt(l * l + Math.pow(1 - l, 2))
        }
        return d
    }

    private scale(d: PointArray, extent: number, mratio: number, sdratio: number): PointArray {
        let n = d.X.length;

        for (let i = 0; i < n; i++) {
            d.X[i] = sdratio * d.X[i] * extent + mratio * extent;
            d.Y[i] = sdratio * d.Y[i] * extent + mratio * extent;
        }
        return d
    }

    private check(d: PointArray, extent: number) {
        let n = d.X.length;
        for (let i = 0; i < n; i++) {
            if (d.X[i] < 0 || d.X[i] > extent || d.Y[i] < 0 || d.Y[i] > extent || isNaN(d.Y[i]))
                return -1
        }
    }
}
