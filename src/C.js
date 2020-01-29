let __ = require('./__'),
    Tensor = require('./tensor');

//------ complex casting ------

let C =
    (x, y) => typeof x === 'number'
        ? ({ Re: x, Im: y || 0 })
        : x

//------ complex field ------

C.i = C(0,1);

let Re = z => typeof z === 'number' ? z : z.Re,
    Im = z => typeof z === 'number' ? 0 : z.Im;

let add = 
    (a, b) => C(
        Re(a) + Re(b),
        Im(a) + Im(b)
    );

let mult = 
    (a, b) => C(
        Re(a) * Re(b) - Im(a) * Im(b),
        Re(a) * Im(b) + Im(a) * Re(b)
    );

let bar     = z => C(Re(z), -Im(z)),
    abs2    = z => Re(z)**2 + Im(z)**2,
    abs     = z => Math.sqrt(abs2(z)),
    inv     = z => mult(C(1 / abs2(z)), bar(z)),
    zero    = _ => C(0),
    unit    = _ => C(1);

__.setKeys(
    { add, mult, inv, zero, unit },
    { Im, Re, bar, abs }
)(C);


//------ complex ND-arrays ------

let _C = Tensor(C);


//------ polar coordinates, exp and log  ------

let sign = t => Math.sign(t) || 1;

let phase = 
    z => Re(z) === 0 
        ? Math.sign(Im(z)) * (Math.PI / 2)
        : Math.atan(Im(z) / Re(z)) -
                (Re(z) > 0 ? 0 : sign(Im(z)) * Math.PI);

let expi = 
    t => C(Math.cos(t), Math.sin(t));

_C.exp = 
    _C.map( 
        z => mult(
            C(Math.exp(Re(z))), 
            expi(Im(z))
        )
    );

_C.log = 
    _C.map(
        z => C(Math.log(abs(z)), phase(z))
    );

_C.phase    = _C.map(phase);
_C.expi     = _C.map(expi);
_C.i        = C.i;

module.exports = _C;
