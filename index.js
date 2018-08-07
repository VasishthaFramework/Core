const http = require('http');
const fs = require('fs');
const EventEmitter = require('events');

class Avayay extends EventEmitter
{
    constructor()
    {
        super();
        this.server = null;
        this.controllers = {};
        this.views = {};
    }

    start(port = 80)
    {
        this.port = port;
        this.server = http.createServer(
            function (request,response){
                const url = request.url;
            }
        ).listen(this.port,'0.0.0.0');
        return Promise.resolve(this.server);
    }

}

const a1 = new Avayay();
a1.start(9081).then( (server) => console.log("Server has started on PORT: 9081") );
