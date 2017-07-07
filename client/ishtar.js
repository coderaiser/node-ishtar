'use strict';

const Emitify = require('emitify/legacy');
const io = require('socket.io-client/dist/socket.io');

module.exports = (prefix, socketPath, callback) => {
    if (!callback) {
        if (!socketPath) {
            callback    = prefix;
            prefix      = '/ishtar';
        } else {
            callback    = socketPath;
            socketPath  = '';
        }
    }
    
    socketPath += '/socket.io';
    
    init();
    
    if (typeof callback === 'function')
        callback(Ishtar(prefix, socketPath));
}

function Ishtar(prefix, socketPath) {
    if (!(this instanceof Ishtar))
        return new Ishtar(prefix, socketPath);
    
    Emitify.call(this);
    this._progress = ProgressProto(prefix, socketPath, this);
}

function init() {
    Ishtar.prototype = Object.create(Emitify.prototype);
    
    Ishtar.prototype.pack = (from, to, files) => {
        this._progress.pack(from, to, files);
    };
    
    Ishtar.prototype.extract = (from, to, files) => {
        this._progress.extract(from, to, files);
    };
    
    Ishtar.prototype.abort = () => {
        this._progress.abort();
    };
    
    Ishtar.prototype.pause = () => {
        this._progress.pause();
    };
    
    Ishtar.prototype.continue = () => {
        this._progress.continue();
    };
}

function ProgressProto(room, socketPath, ishtar) {
    if (!(this instanceof ProgressProto))
        return new ProgressProto(room, socketPath, ishtar);
    
    const href = getHost();
    const FIVE_SECONDS = 5000;
    
    const socket = io.connect(href + room, {
        'max reconnection attempts' : Math.pow(2, 32),
        'reconnection limit'        : FIVE_SECONDS,
        path: socketPath,
    });
    
    ishtar.on('auth', (username, password) => {
        socket.emit('auth', username, password);
    });
    
    socket.on('accept', () => {
        ishtar.emit('accept');
    });
    
    socket.on('reject', () => {
        ishtar.emit('reject');
    });
    
    socket.on('err', (error) => {
        ishtar.emit('error', error);
    });
    
    socket.on('file', (name) => {
        ishtar.emit('file', name);
    });
    
    socket.on('progress', (percent) => {
        ishtar.emit('progress', percent);
    });
    
    socket.on('end', () => {
        ishtar.emit('end');
    });
    
    socket.on('connect', () => {
        ishtar.emit('connect');
    });
    
    socket.on('disconnect', () => {
        ishtar.emit('disconnect');
    });
    
    this.pause = () => {
        socket.emit('continue');
    };
    
    this.continue = () => {
        socket.emit('continue');
    };
    
    this.abort = () => {
        socket.emit('abort');
    };
    
    this.pack = (from, to, files) => {
        socket.emit('pack', from, to, files);
    };
    
    this.extract = (from, to) => {
        socket.emit('extract', from, to);
    };
    
    function getHost() {
        const l = location;
        const href = l.origin || l.protocol + '//' + l.host;
        
        return href;
    }
}

