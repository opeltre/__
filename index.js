let __ = require('./src/__'),
    record = require('./src/record'),
    nd = require('./src/nd_array'),
    getset = require('./src/getset'),
    alg = require('./src/alg/index'),
    top = require('./src/top/index');

module.exports = Object.assign(__, {
    record: record.new,
    r: record,
    nd,
    getset,
    alg, 
    top
});
