(function() {
    'use strict';
    
    var jaguar  = require('jaguar'),
        mellow  = require('mellow');
    
    module.exports = function(socket, options) {
        if (!options)
            options = {};
        
        listen(socket, options);
    };
    
    function getRoot(root) {
        var value;
        
        if (typeof root === 'function')
            value = root();
        else
            value = root;
        
        return value;
    }
    
    function isRootWin32(path, root) {
        var isRoot      = path === '/',
            isWin32     = process.platform === 'win32',
            isConfig    = root === '/';
        
        return isWin32 && isRoot && isConfig;
    }
    
    function getWin32RootMsg() {
        var message  = 'Could not jaguar from/to root on windows!',
            error       = Error(message);
        
        return error;
    }
    
    function listen(socket, options) {
        var prefix  = options.prefix || 'ishtar',
            root    = options.root   || '/';
        
        socket.of(prefix)
            .on('connection', function(socket) {
                socket.on('pack', function(from, to, files) {
                    preprocess('pack', root, socket, from, to, files);
                });
                
                socket.on('extract', function(from, to) {
                    preprocess('extract', socket, from, to);
                });
                
                socket.on('error', function(error) {
                    console.error('ishtar', error);
                });
            })
            .on('error', function(error) {
                console.error(error);
            });
    }
    
    function preprocess(op, root, socket, from, to, files) {
        var value   = getRoot(root);
        
        from        = mellow.pathToWin(from, value);
        to          = mellow.pathToWin(to, value);
        
        if (![from, to].some(function(item) {
            return isRootWin32(item, value);
        })) {
            operate(socket, op, from, to, files);
        } else {
            socket.emit('err',  getWin32RootMsg());
            socket.emit('end');
        }
    }
    
    function operate(socket, op, from, to, files) {
        var fn, packer;
        
        switch(op) {
        case 'pack':
            fn = jaguar.pack;
            break;
        
        case 'extract':
            fn = jaguar.extract;
            break;
        
        default:
            throw Error('op could be pack/extract only!');
        }
        
        packer = fn(from, to, files);
        
        packer.on('file', function(name) {
            socket.emit('file', name);
        });
        
        packer.on('progress', function(percent) {
            socket.emit('progress', percent); 
        });
        
        packer.on('error', function(error, name) {
            var msg         = error.code + ' :' + error.path,
                onAbort     = function() {
                    packer.abort();
                    socket.removeListener('abort', onAbort);
                };
            
            socket.emit('err', msg, name);
            socket.on('abort',  onAbort);
        });
        
        packer.on('end', function() {
            socket.emit('end');
        });
    }
    
})();
