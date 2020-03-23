let __ = require('../__'),
    Tensor = require('./tensor');

//------ real ND-arrays ------

let _R = Tensor();


//------ exp_ and _log ------

let exp_ = x => Math.exp(-x),
    _log = x => - Math.log(x);

_R.exp_ = _R.map(exp_);
_R._log = _R.map(_log);

_R.free = 
    __.pipe(
        _R.exp_,
        _R.int,
        _log
    );

_R.eff = 
    (is, js) => __.pipe(
        _R.exp_,
        _R.project(is, js),
        _R._log
    );


//------ numerically stable free energy ? ------ 

_R.max = _R.reduce(Math.max);
_R.min = _R.reduce(Math.min);

_R.freeE =
    H => {
        let m = _R.min(H),
            H_m = _R.map(h => h - m)(H);
        return m + _log(_R.int(_R.exp_(H_m)));
    };

_R.gibbs =
    H => {
        let F = _R.freeE(H),
            H_F = _R.map(h => h - F)(H)

        return _R.exp_(H_F);
    }; 

_R.effE = 
    (is, js) => 
        H => {
            let m = _R.min(H),
                H_m = _R.map(h => h - m)(H),
                sum = _R.project(is, js),
                eff_m = _R._log(sum(_R.exp_(H_m)));

            return _R.map(h => h + m)(eff_m);
        };

module.exports = _R;
