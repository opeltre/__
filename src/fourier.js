/*  The Fast Fourier Transform `divide and conquer' scheme 
 *  is canonically adapted for computing Fourier transforms 
 *  on a product set. 
 *  
 *  Example
 *  -------
 *  Compare the product set {1...N1} x {1...N2} with {1...N1*N2}. 
 *  Letting:
 *      - x = x1    + N1*x2
 *      - y ⁼ N2*y1 + y2 
 *  And denoting phases by:
 *      - phi   = 2 pi (x, y) / N1*N2
 *      - phi1  = 2 pi x1*y1 / N1
 *      - phi2  = 2 pi x2*y2 / N2
 *  One does get `phi = phi1 + phi2' in R mod (2 pi).
 *  
 *  Conclusion
 *  ----------
 *  FFT should be implemented here. 
 */

let __ = require('./__'),
    _R = require('./R'),
    _C = require('./C');

//------ (slow) Fourier transform ------

let Fourier = 

    u => {

        let dims = _C.shape(u),
            e_i = _F.waves(dims),
            norm = Math.sqrt(_C.size(u));

        let Fu = 
            k => _C.scale(1 / norm)(_C.inner(e_i(k), u))

        return _C.compute(dims)(Fu);

    };

let _F = 
    u => Array.isArray(u)
        ? Fourier(_C(u))
        : u;

_F.bar = 
    __.pipe(_C.reverse, _F);


//------ spectral domain [ 0, 2 pi [ ------

_F.circle = 
    N => __.range(N).map(
        n => 2 * n * Math.PI / N
    );

_F.compute = 
    Ns => _C.compute(Ns.map(_F.circle));


//------ plane waves Fourier basis ------

_F.waves = 
    Ns => k => _F.compute(Ns)(
        x => _C.expi(_R.inner(k, x))
    );

module.exports = _F
