let __ = require('./__'),
    _r = require('./record');

let getset =  
    (my, attrs, types={}) => {

        let records = types.records || [],
            arrays = types.arrays || [];

        _r.forEach(
            (_, n) => {my[n] = getset.method(my, n, attrs)}
        )(attrs);

        records.forEach(n => {my[n] = getset.recordMethod(my, n, attrs)});

        arrays.forEach(n => {my[n] = method.arrayMethod(my, n, attrs)});
        
        return my;
    }


getset.method = (my, name, attrs) => {
    return function (x) {
        if (!arguments.length)
            return attrs[name];
        attrs[name] = x;
        return my;
    };
}


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

module.exports = getset;

