let __ = require('../__'),
    ND = require('../nd_array'),
    {cell} = require('../top/id');
    
let record = require('../record');

module.exports = Tensor;

function Tensor(K={}) {
//  Create the ND-algebra type instance of tensors over the field K.

    //====== inherit from ND type instance ======
    let nd = ND();
    //------ cast scalars to K ------
    let toK = typeof K === 'function' 
            ? K
            : __.id;
    let _K = nd.mapN(toK);
    record.assign(nd)(_K);


    //====== K-tensors ======

    //------ field methods ------
    let add     = K.add     || ((a, b) => a + b),
        mult    = K.mult    || ((a, b) => a * b),
        inv     = K.inv     || (a => 1 / a),
        zero    = K.zero    || (_ => toK(0)),
        unit    = K.unit    || (_ => toK(1)),
        abs     = K.abs     || Math.abs;


    //------ linear structure ------

    _K.add2 = 
        _K.map2(add);

    _K.add = 
        (...as) => as.reduce(_K.add2);

    _K.scale = 
        z => _K.map(a => mult(toK(z), a));

    _K.minus = 
        _K.scale(-1);

    _K.subt = 
        (a, b) => _K.add(a, _K.minus(b));

    _K.span = 
        (ks, as) => _K.add(
            as.map((a, i) => _K.scale(ks[i])(a))
        );

    _K.zero = 
        (Ns) => _K.compute(Ns)(zero);


    //------ ring structure ------

    _K.mult =
        _K.map2(mult);

    _K.unit = 
        (Ns) => _K.compute(Ns)(unit);


    //------ multiplicative group ------

    _K.inv = 
        _K.map(inv);

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
        u => mult(_K.int(u), toK(1 / _K.size(u)));

    _K.inner = 
        K.bar
            ? __.pipe(
                (a, b) => _K.mult(_K.bar(a), b),
                _K.int
            )
            : __.pipe(_K.mult, _K.int);

    _K.abs = 
        _K.map(abs);

    _K.norm = 
        a => Math.sqrt((K.Re || __.id)(
            _K.inner(a, a)
        ));



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
                    : _K.project(is, [j, ...js])(q.reduce(_K.add2))
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



Tensor.functor = function (E, K) {
//  Return the two-sided functor K^E:
//      E : I -> [num] describes the possible states of each coordinate. 

    let _K = Tensor(K); 

    //------ compute, shapes given by E ------
    let compute = _K.compute,
        Es = is => cell(is).map(E);

    _K.compute = 
        is => compute(Es(is));

    //------ functorial maps ------
    _K.func = 
        (is, js) => _K.project(is, js);

    _K.cofunc = 
        (is, js) => _K.extend(is, js, Es(is));

    return _K;

}
