let __ = require('./__'),
    _r = require('./record');

/*------ Chainable getter-setters ------

    This module assigns convenience accessor methods to an object `my`,
    keeping references to an internal state object `attrs`. 
    
    getset : a -> {s} -> {?s -> St({s}, s | a)}

        where a.method  : ?s -> St({s}, s | a) 
                        : [get] _ -> St({s}, s)   
                        : [set] s -> St({s}, a)   
*/

let getset =  
    (my, attrs, types={}) => {

        let records = types.records || [],
            arrays = types.arrays || [],
            apply = types.apply || [];

        _r.forEach(
            (_, n) => {my[n] = getset.method(my, n, attrs)}
        )(attrs);

        records.forEach(n => {my[n] = getset.recordMethod(my, n, attrs)});

        arrays.forEach(n => {my[n] = getset.arrayMethod(my, n, attrs)});

        apply.forEach(n => {my[n] = getset.applyMethod(my, n, attrs)});
        
        return my;
    }

//------ attrs[name] : s ------
getset.method = (my, name, attrs) => {
    return function (x) {
        if (!arguments.length)
            return attrs[name];
        attrs[name] = x;
        return my;
    };
}

//------ attrs[name] : s = {s'} ------
getset.recordMethod = (my, name, attrs) => {
    return function (x, y) {
        if (!arguments.length) 
            return attrs[name];
        else if (typeof x === 'string' && arguments.length === 1)
            return attrs[name][x];
        else if (typeof x === 'string' && arguments.length === 2)
            attrs[name][x] = y;
        else 
            attrs[name] = x;
        return my;
    }
};

//------ attrs[name] : s = [s'] ------
getset.arrayMethod = function (my, name, attrs) {
    return function (x, y) {
        if (typeof x === 'undefined')
            return attrs[name];
        if (Array.isArray(x))
            attrs[name] = x;
        else if (x === '...')
            attrs[name] = [...attrs[name], x, ...y];
        else if (typeof x === 'number') 
            attrs[name][i] = y
        return my;
    }
}

//------ attrs[name] : s = attrs ?-> s' ------
getset.applyMethod = function (my, name, attrs) {
    return function (x) {
        if (!arguments.length) 
            return attrs[name];
        attrs[name] = __(x)(attrs);
        return my;
    }
};

module.exports = getset;

