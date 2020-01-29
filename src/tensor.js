let __ = require('./__'),
    ND = require('./nd_array.js');

module.exports = Tensor;

//------ real field ------

let R = {
    add     : (a, b) => a + b,
    mult    : (a, b) => a * b,
    inv     : a => 1/a,
    zero    : _ => 0,
    unit    : _ => 1,
    abs     : Math.abs
};


function Tensor(K=R) {
//  Create the ND-algebra type instance of tensors over the field K.

    let nd = ND(); 
        
    //------ cast scalars to K ------
    let toK = typeof K === 'function' 
            ? K
            : __.id;
    let _K = nd.mapN(toK);

    //------ inherit from nd ------
    __.setKeys(nd)(_K);


    //------ linear structure ------

    _K.add = 
        (...as) => as.reduce(_K.map2(K.add))

    _K.scale = 
        z => _K.map(a => K.mult(toK(z), a));

    _K.minus = 
        _K.scale(-1);

    _K.subt = 
        (a, b) => _K.add(a, _K.minus(b));

    _K.span = 
        (ks, as) => _K.add(
            as.map((a, i) => _K.scale(ks[i])(a))
        );

    _K.zero = 
        (Ns) => _K.compute(Ns)(K.zero);


    //------ ring structure ------

    _K.mult =
        (...as) => as.reduce(_K.map2(K.mult));

    _K.unit = 
        (Ns) => _K.compute(Ns)(K.unit);


    //------ multiplicative group ------

    _K.inv = 
        _K.map(K.inv);

    _K.div = 
        (a, b) => _K.mult(a, _K.inv(b));

    //------ complex / quaternionic operations ------

    if (K.bar) 
        _K.bar = _K.map(K.bar);

    if (K.Re) 
        _K.Re = _K.map(K.Re);

    if (K.Im)
        _K.Im = _K.map(K.Im);


    //------ integration and inner product ------

    _K.int = _K.reduce(_K.add);

    _K.mean = 
        u => K.mult(_K.int(u), toK(1 / _K.size(u)));

    _K.inner = 
        K.bar
            ? __.pipe(
                (a, b) => _K.mult(_K.bar(a), b),
                _K.int
            )
            : __.pipe(_K.mult, _K.int);

    _K.abs = 
        _K.map(K.abs);

    _K.norm = 
        p => _K.int(_K.map(a => abs(a)**2));


    //------ adjoint extension and projection ------

    let extend = 
        ([i, ...is], [j, ...js], [E, ...Es]) => 
            q => typeof i === 'undefined' 
                ? q 
                : (i === j 
                    ? q.map(_K.extend(is, js, Es))
                    : E.map(
                        _ => _K.extend(is, [j, ...js], Es)(q)
                    )
                );

    let project = 
        ([i, ...is], [j, ...js]) => 
            q => typeof(i) === 'undefined'
                ? q
                : ( i === j 
                    ? __.map(_K.project(is, js))(q)
                    : _K.project(is, [j, ...js])(q.reduce(_K.add))
                );

    let indices = js => 
        Array.isArray(js) 
            ? js
            : js.split('.').filter(j => j !== '');

    _K.project = 
        (a, b) => project(...[a, b].map(indices));

    _K.extend = 
        (a, b, Es) => extend(...[a, b].map(indices), Es);

    return _K;

}
