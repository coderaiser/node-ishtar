# Ishtar [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL]

pack and extract .tar.gz archives middleware based on [socket.io](http://socket.io "Socket.io") and [jaguar](https://github.com/coderaiser/node-jaguar "Jaguar").

## Install

```
npm i ishtar --save
```

## Client

Could be loaded from url `/ishtar/ishtar.js`.

```js
const prefix = '/ishtar';

/* could be one argument: callback */
ishtar(prefix, function(packer) {
    const from = '/';
    const to = '/tmp';
    const names = [
        'bin'
    ];
    const progress = (value) => {
        console.log('progress:', value);
    },
    
    const end = () => {
        console.log('end');
        packer.removeListener('progress', progress);
        packer.removeListener('end', end);
    };
    
    packer.pack(from, to, names);
    
    packer.on('progress', progress);
    packer.on('end', end);
    packer.on('error', (error) => {
        console.error(error.message);
    });
});

```

## Server

```js
const ishtar = require('ishtar');
const http = require('http');
const express = require('express');
const io = require('socket.io');
const app = express();
const port = 1337;
const server = http.createServer(app);
const socket = io.listen(server);

server.listen(port);

app.use(ishtar({
    online: true,
    authCheck: function(socket, success) {
    }
});

ishtar.listen(socket, {
    prefix: '/ishtar',   /* default              */
    root: '/',          /* string or function   */
});
```

## Environments

In old `node.js` environments that supports `es5` only, `dword` could be used with:

```js
var ishtar = require('ishtar/legacy');
```

## Related

- [Salam](https://github.com/coderaiser/node-salam "Salam") - Pack and extract zip archives middleware.

## License

MIT

[NPMIMGURL]:                https://img.shields.io/npm/v/ishtar.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/coderaiser/node-ishtar.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/ishtar "npm"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/node-ishtar "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"

