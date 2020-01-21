let _R = require('./R'),
    _C = require('./C'),
    __ = require('./__');

let Fourier = 

    u => {

        let dims = _C.shape(u),
            e_i = F.waves(dims),
            volume = dims.reduce(_R.mult, 1),
            factor = 1 / Math.sqrt(volume);

        let Fu = 
            k => _C.scale(factor)(_C.inner(e_i(k), u))

        return _C.compute(dims)(Fu);

    };


let _F = 
    __.pipe(_C, Fourier);

_F.bar = 
    __.pipe(_R.reverse, _F);

_F.waves = 
    Ns => k => _F.compute(Ns)(
        x => _C.expi(_R.inner(k, x))
    );

_F.circle = 
    N => __.range(N).map(
        n => 2 * n * Math.PI / N
    );

_F.compute = 
    Ns => _R.compute(Ns.map(_F.circle));

module.exports = 
    u => Array.isArray(u) ? _F(u) : u;
