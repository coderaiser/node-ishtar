# Ishtar

pack and extract .tar.gz archives middleware based on [socket.io](http://socket.io "Socket.io") and [copymitter](https://github.com/coderaiser/node-jaguar "Jaguar").

## Install

```
npm i ishtar --save
```

## Client

Could be loaded from url `/ishtar/ishtar.js`.

```js
var prefix = '/ishtar';

/* could be one argument: callback */
ishtar(prefix, function() {
    var from        = '/',
        to          = '/tmp',
        names       = [
            'bin'
        ],
        progress    = function(value) {
            console.log('progress:', value);
        },
        
        end     = function() {
            console.log('end');
            ishtar.removeListener('progress', progress);
            ishtar.removeListener('end', end);
        };
    
    ishtar(from, to, names);
    
    ishtar.on('progress', progress);
    ishtar.on('end', end);
    ishtar.on('error', function(error) {
        console.error(error.message);
    });
});

```

## Server

```js
var ishtar       = require('ishtar'),
    http        = require('http'),
    express     = require('express'),
    io          = require('socket.io'),
    app         = express(),
    port        = 1337,
    server      = http.createServer(app),
    socket      = io.listen(server);
    
server.listen(port);

app.use(ishtar({
    minify: true,
    online: true
});

ishtar.listen(socket, {
    prefix: '/ishtar',   /* default              */
    root: '/',          /* string or function   */
});
```

## License

MIT
