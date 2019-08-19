let C = require('./C'),
    Alg = require('./R'),
    __ = require('./__');

let Fourier = 
    u => {
        let Ns = Alg.shape(u),
            Vol = Ns.reduce(Alg.mult),
            wave = F.wave(Ns);

        let Fu = __.pipe(
            k => C.scalar(wave(k), u),
            C.scale(1 / Math.sqrt(Vol))
        );

        return Alg.compute(Ns)(Fu);
    };

let F = __.pipe(C, Fourier);

F.bar = __.pipe(Alg.reverse, F);

F.circle = 
    N => __.range(N).map(
        n => 2 * n * Math.PI / N
    );

F.wave = 
    Ns => k => F.compute(Ns)(
        x => C.expi(Alg.scalar(k, x))
    );

F.compute = 
    Ns => Alg.compute(Ns.map(F.circle));

module.exports = 
    u => Array.isArray(u) ? F(u) : u;
