import { Point } from "../types";

export interface Visualization {
    name: string;
    render(wrapper: HTMLDivElement, data2: Point[], unitSize: number, dataIndex: number);
}
