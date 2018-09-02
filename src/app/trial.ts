export class Trial {
    correct: 'R' | 'L';
    r1: number;
    r2: number;
    gotItRight: boolean;
    delta: number;
    index: number;
    JND: number;
    fobs: number;
    
    constructor(public rtarget: number, public rvariable: number) {

    }
}
