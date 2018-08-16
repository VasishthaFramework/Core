// Dependancies
const http = require('http');
const fs = require('fs');
const path = require("path");
const url = require('url');
const qs = require('querystring');
const EventEmitter = require('events');

// Framework
const Controller = require('./Controller');
const Request = require('./Request');
const Response = require('./Response');

class V extends EventEmitter
{
    constructor()
    {
        super();
        this._server = null;
        this._controllers = {};
        this._views = {};
    }

    load(folder = "./Controllers")
    {
        const abspath = path.resolve(folder);
        const controllers  = fs.readdirSync(folder);
        for(let controller of controllers)
        {
            controller = controller.split(".").slice(0,controller.length).join(".");
            this.addController(require(`${abspath}/${controller}`))
        }
        return this;
    }

    addController({ path , controller })
    {
        controller = new controller();
        if(controller instanceof Controller)
        {
            this.emit("ControllerAdded",controller);
            controller.init();
            this._controllers[path] = controller; 
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
        this._server = http.createServer(
            (request,response) => {
                const route = url.parse(request.url, true);
                route.post = {};
                const controller = this._controllers[route.pathname];
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
        this.emit("Start",this._server);
        return Promise.resolve(this._server);
    }

}
module.exports = V;