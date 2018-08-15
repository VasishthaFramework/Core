// Dependancies
const http = require('http');
const fs = require('fs');
const url = require('url');
const qs = require('querystring');
const EventEmitter = require('events');

// Framework
const Controller = require('./Controller');
const Request = require('./Request');
const Response = require('./Response');

class Vashi extends EventEmitter
{
    constructor()
    {
        super();
        this.server = null;
        this.controllers = {};
        this.views = {};
    }

    addController(path,controller)
    {
        controller = new controller();
        if(controller instanceof Controller)
        {
            this.emit("ControllerAdded",controller);
            if(this.controllers[path] != undefined)
            {
                if(this.controller[path] instanceof Array)
                {
                    this.controllers[path].push(new controller());
                }
                else 
                {
                    const temp = this.controllers[path];
                    this.controllers[path] = [];
                    if ( Array.isArray(temp) ) this.controllers[path].push(...temp);
                    else this.controllers[path].push(temp);
                    this.controllers[path].push(new controller());
                }
            }
            else
            {
                this.controllers[path] = controller; 
            }
        }
        else
        {
            throw new Error("The Given Class Should be Instance of Controller");
        }
        return this;
    }

    start(port = 80)
    {
        this.port = port;
        this.server = http.createServer(
            (request,response) => {
                const route = url.parse(request.url, true);
                route.post = {};
                const controller = this.controllers[route.pathname];
                const method = request.method;
                if (method == 'POST') {
                    var body = '';
                    request.on('data', function (data) {
                        body += data;
                    })
                    request.on('end', function () {
                        route.post = qs.parse(body);
                    });
                }
                if(controller != undefined)
                {
                    console.log(`Controller: ${route.pathname}`);
                    const reqw = new Request(request,route);
                    const resw = new Response(response);
                    if(method.toLowerCase() in controller)
                    {
                        controller[method.toLowerCase()](reqw,resw);
                    }
                } 
                else
                {
                    response.end("<h1>404: No Such Controller :( </h1>");
                }
            }
        ).listen(this.port,'0.0.0.0');
        this.emit("ServerStarted",this.server);
        return Promise.resolve(this.server);
    }

}
module.exports = Vashi;