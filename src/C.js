let Alg = require('./R'),
    __ = require('./__');

let C = Alg.mapN(
    (x, y) => typeof x === 'number'
        ? ({ Re: x, Im: y || 0 })
        : x
);

C.i = C(0,1);

let Re = z => typeof z === 'number' ? z : z.Re,
    Im = z => typeof z === 'number' ? 0 : z.Im;

C.Re = Alg.map(Re);
C.Im = Alg.map(Im);

let bar = 
    z => C(Re(z), -Im(z));

C.bar = Alg.map(bar);

let minus = 
    z => C(-Re(z), -Im(z));

C.minus = Alg.map(minus);

let add = 
    (a, b) => C(
        Re(a) + Re(b),
        Im(a) + Im(b)
    );

C.add = Alg.map2(add);

C.subt = 
    (a, b) => C.add(a, C.minus(b));
        
let mult = 
    (a, b) => C(
        Re(a) * Re(b) - Im(a) * Im(b),
        Re(a) * Im(b) + Im(a) * Re(b)
    );

C.mult = Alg.map2(mult);

C.scale = 
    t => Alg.map(z => mult(C(t), z))

let abs = 
    z => Math.sqrt(Re(z)**2 + Im(z)**2);

C.abs = Alg.map(abs);

let sign = t => Math.sign(t) || 1;

let phase = 
    z => Re(z) === 0 
        ? Math.sign(Im(z)) * (Math.PI / 2)
        : Math.atan(Im(z)/Re(z)) - (Re(z) > 0 ? 0 : sign(Im(z)) * Math.PI);

C.phase = Alg.map(phase);

C.mass = Alg.reduce(C.add);

C.scalar = __.pipe(
    (a, b) => C.mult(C.bar(a), b),
    C.mass
);

C.norm = 
    a => Math.sqrt(C.Re(C.scalar(a, a)));

C.expi = 
    t => C(Math.cos(t), Math.sin(t));

C.exp = 
    z => C.mult(
        C(Math.exp(Re(z))), 
        C.expi(Im(z))
    );

module.exports = C;
