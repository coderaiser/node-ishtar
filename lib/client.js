var io, exec, Emitify, loadRemote;

(function(global) {
    'use strict';
    
    if (typeof module !== 'undefined' && module.exports)
        module.exports  = new IshtarProto();
    else
        global.ishtar    = new IshtarProto();
    
    function IshtarProto() {
        var Progress;
        
        function Ishtar(prefix, callback) {
            if (!callback) {
                callback    = prefix;
                prefix      = '/ishtar';
            }
            
            loadAll(prefix, function() {
                Progress = new ProgressProto(prefix);
                Object.setPrototypeOf(Ishtar, Emitify());
                
                if (typeof callback === 'function')
                    callback();
            });
        }
        
        Ishtar.pack  = function(from, to, files) {
            Progress.pack(from, to, files);
        };
        
        Ishtar.extract  = function(from, to) {
            Progress.pack(from, to);
        };
        
        Ishtar.abort = function() {
            Progress.abort();
        };
        
        Ishtar.pause = function() {
            Progress.pause();
        };
        
        Ishtar.continue = function() {
            Progress.continue();
        };
        
        function loadAll(prefix, callback) {
            var scripts = [];
            
            if (!exec)
                scripts.push('/modules/execon/lib/exec.js');
            
            if (!scripts.length)
                loadFiles(prefix, callback);
            else
                loadScript(scripts.map(function(name) {
                    return prefix + name;
                }), function() {
                    loadFiles(prefix, callback);
                }); 
        }
        
        function getModulePath(name, lib) {
            var dir     = '/modules/',
                libdir  = (lib || '') + '/',
                path    = dir + name + libdir + name + '.js';
            
            return path;
        }
        
        function loadFiles(prefix, callback) {
            exec.series([
                function(callback) {
                    var obj     = {
                            loadRemote  : getModulePath('loadremote', 'lib'),
                            load        : getModulePath('load'),
                            Emitify     : getModulePath('emitify', 'lib'),
                            join        : '/join/join.js'
                        },
                        
                        scripts = Object.keys(obj)
                            .filter(function(name) {
                                return !window[name];
                            })
                            .map(function(name) {
                                return prefix + obj[name];
                            });
                    
                    exec.if(!scripts.length, callback, function() {
                        loadScript(scripts, callback);
                    });
                },
                
                function(callback) {
                    loadRemote('socket', {
                        name : 'io',
                        prefix: prefix,
                        noPrefix: true
                    }, callback);
                },
                
                function() {
                    callback();
                }
            ]);
        }
        
        function loadScript(srcs, callback) {
            var i       = srcs.length,
                func    = function() {
                    --i;
                    
                    if (!i)
                        callback();
                };
            
            srcs.forEach(function(src) {
                var element = document.createElement('script');
                
                element.src = src;
                element.addEventListener('load', function load() {
                    func();
                    element.removeEventListener('load', load);
                });
                
                document.body.appendChild(element);
            });
        }
        
        function ProgressProto(room) {
            var socket;
            
            init(room);
            
            function init(room) {
                var href            = getHost(),
                    FIVE_SECONDS    = 5000;
                
                socket = io.connect(href + room, {
                    'max reconnection attempts' : Math.pow(2, 32),
                    'reconnection limit'        : FIVE_SECONDS
                });
                
                socket.on('err', function(error) {
                    Ishtar.emit('error', error);
                });
                
                socket.on('file', function(name) {
                    Ishtar.emit('file', name);
                });
                
                socket.on('progress', function(percent) {
                    Ishtar.emit('progress', percent);
                });
                
                socket.on('end', function() {
                    Ishtar.emit('end');
                });
                
                socket.on('connect', function() {
                    Ishtar.emit('connect');
                });
                
                socket.on('disconnect', function() {
                    Ishtar.emit('disconnect');
                });
            }
            
            this.abort       = function() {
                socket.emit('abort');
            };
            
            this.pack       = function(from, to, files) {
                socket.emit('pack', from, to, files);
            };
            
            this.extract    = function(from, to) {
                socket.emit('extract', from, to);
            };
            
            function getHost() {
                var l       = location,
                    href    = l.origin || l.protocol + '//' + l.host;
                
                return href;
            }
        }
        
        return Ishtar;
    }
    
})(this);
