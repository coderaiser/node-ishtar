'use strict';

const DIR_ROOT = __dirname + '/..';
const path = require('path');

const currify = require('currify/legacy');
const express = require('express');
const Router = express.Router;

const packer = require('./packer');

const ishtarFn = currify(_ishtarFn);
const isDev = process.env.NODE_ENV === 'development';

module.exports = (options) => {
    options = options || {};
    const router = Router();
    const prefix = options.prefix || '/ishtar';
    
    router.route(prefix + '/*')
        .get(ishtarFn(options))
        .get(staticFn)
    
    return router;
};

module.exports.listen = (socket, options) => {
    if (!options)
        options = {};
    
    if (!options.prefix)
        options.prefix = 'ishtar';
    
    if (!options.root)
        options.root = '/';
    
    packer(socket, options);
};

function _ishtarFn(options, req, res, next) {
    const o = options || {};
    const prefix = o.prefix || '/ishtar';
    const url = req.url
    
    if (url.indexOf(prefix))
        return next();
    
    req.url = req.url.replace(prefix, '');
    
    if (/^\/(ishtar|0)\.js(\.map)?$/.test(req.url))
        req.url = '/dist' + req.url;
    
    if (isDev)
        req.url = req.url.replace(/^\/dist\//, '/dist-dev/');
    
    next();
}

function staticFn(req, res) {
    const file = path.normalize(DIR_ROOT + req.url);
    res.sendFile(file);
}

