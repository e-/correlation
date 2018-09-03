import { Point } from "../types";

export interface Visualization {
    render(wrapper: HTMLDivElement, data2: Point[]);
}
