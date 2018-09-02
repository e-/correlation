import { Run } from "./run";
import { Trial } from "./trial";
import { variance, mean } from "./util";

export class Experimenter {
    currentRun: Run;
    runIndex = 0;
    trialIndex = 0;
    allTrials: Trial[][] = [];
    trials: Trial[];

    constructor(public runs: Run[], public allowViolation = false) {
        this.currentRun = this.runs[this.runIndex];
        this.trials = [];
        this.allTrials.push(this.trials);
    }

    next() {
        let r1 = this.currentRun.rbase,
            r2 = this.currentRun.rbase + this.currentRun.dir * this.currentRun.delta;

        // update delta if people hit the ceiling (in case of accidental wrong hit or stupid)
        if (r2 > 1) {
            r2 = 1;
            this.currentRun.delta = Math.abs(r1 - r2);
        }

        // if delta below 0 is not allowed, keep r2 at 0
        if (!this.allowViolation && r1 * r2 < 0) {
            r2 = Math.max(0, r2);
        }

        let trial = new Trial(r1, r2);

        // swap r1 and r2 at random before displaying (originals recorded in m.currentTrial
        // Note: this swap can't be done before recording r1 and r2 in currentTrial
        if (Math.random() > 0.5) { let tmp = r1; r1 = r2; r2 = tmp; }

        // record correct choice (after swap)
        trial.correct = (r1 - r2) > 0 ? 'L' : 'R';
        trial.r1 = r1;
        trial.r2 = r2;
        trial.index = this.trialIndex++;

        // debug message
        // var countw = 0
        // if (m.debug) { console.log('current comparison: left: ' + r1 + ', right: ' + r2); countw++; }
        // if (m.debug) { console.log('current approach: ' + data.direction); }

        this.trials.push(trial);
        return trial;
    }

    grade(trial: Trial, choice: 'L'|'R') {
        let gotItRight = choice == trial.correct;

        // see if current choice and correct choice match
        trial.gotItRight = gotItRight;

        // add current delta to our trial data before updating
        if (this.allowViolation)
            trial.delta = this.currentRun.delta; // if we allow negative, we record delta as usual
        else
            trial.delta = this.currentRun.delta = Math.abs(trial.rtarget - trial.rvariable);	// if not, the, limit delta to the true delta

        // if (m.debug) { console.log("record delta as " + m.ct.delta); }
        // update delta based on correct response (0.12 because Lane doesn't float)
        if (gotItRight)
            this.currentRun.delta = (this.currentRun.delta > 0.012 /* * factor */) ?
                this.currentRun.delta - this.currentRun.deltaRight : this.currentRun.delta;
        else
            this.currentRun.delta += this.currentRun.deltaWrong /* * factor */;



        // debug message
        console.log(gotItRight);

        // when count reaches 23 (24 total trials) begin checking variance
        if(this.trialIndex > 22) {
            let fobs = this.checkVariance(trial);
            if(fobs < 0.25 || trial.index === this.currentRun.maxTrials - 1) {
                return true;
                // break;
            }
        }
        // after checking variance, if the participant has already finished
        // 50 trials or "fobs" is < 0.25, end
        // otherwise show feedback and begin next trial

        return false;
    }

    checkVariance(trial: Trial) {
        // if(m.debug) console.log('checking variance');
        // get all deltas so far and push current delta

        let deltarr = this.trials.map(d => d.delta);
        let len = deltarr.length;

        // Follow Rensink's "F-test"
        let sub1      = deltarr.slice(len - 23, len - 15),
            sub2      = deltarr.slice(len - 15, len - 7),
            sub3      = deltarr.slice(len - 7, len + 1),
            var1      = variance(sub1),
            var2      = variance(sub2),
            var3      = variance(sub3),
            avg1      = mean(sub1),
            avg2      = mean(sub2),
            avg3      = mean(sub3),
            varAvgSub = variance([avg1, avg2, avg3]),
            avgVarSub = mean([var1, var2, var3]);

        // jnd is the average of the average deltas
        trial.JND = mean([avg1, avg2, avg3]);
        // k * varAvgSub / dfbetween = MS bt
        // k * avgVarSub / dfwithin = MS wthin
        // Fobs = MS bt / MS wthin
        //      = varAvgSub / avgVarSub * (dfwithin / dfbetween)
        // 2.57 = data.fcrit * (21 / 2) | Œ± = 0.1
        // fcrit = 0.2447 ‚âà 0.25
        trial.fobs = (varAvgSub / avgVarSub);

        // Several debug messages needed here
        // if(m.debug) console.log('current deltarr: '+deltarr);
        // if(m.debug) console.log('sub1: '+ sub1);
        // if(m.debug) console.log('sub2: '+ sub2);
        // if(m.debug) console.log('sub3: '+ sub3);
        // if(m.debug) console.log('aver1-3: '+ avg1 + " , " + avg2 + " , " + avg3);
        // if(m.debug) console.log('var1-3: '+ var1 + " , " + var2 + " , " + var3);
        // if(m.debug) console.log('current varAvgSub: '+varAvgSub);
        // if(m.debug) console.log('current avgVarSub: '+avgVarSub);
        // if(m.debug) console.log('current JND: '+data.JND);
        // if(m.debug) console.log('current fobs: '+data.fobs);
        // if(m.debug) console.log('current trial (ct): '+m.ct);

        return trial.fobs;
      }

}
