// Dependancies
const http = require('http');
const fs = require('fs');
const url = require('url');
const EventEmitter = require('events');

// Framework
const Controller = require('./Controller');
const Request = require('./Request');
const Response = require('./Request');

class Avayay extends EventEmitter
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
                    this.controllers[path].push(temp);
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
    }

    start(port = 80)
    {
        this.port = port;
        this.server = http.createServer(
            (request,response) => {
                const route = url.parse(request.url, true);
                const controller = this.controllers[route.pathname];
                const method = request.method;
                if(controller != undefined)
                {
                    console.log("Controller Found!");
                    console.log(route);
                    const reqw = new Request(request,route);
                    const resw = new Response(response);
                    controller[method.toLowerCase()](reqw,resw);
                } 
                else
                {
                    response.end("<h1>Controller Does Not Exist :( !</h1>");
                }
            }
        ).listen(this.port,'0.0.0.0');
        this.emit("ServerStarted",this.server);
        return Promise.resolve(this.server);
    }

}

const C1 = require("./C1");
const a1 = new Avayay();
a1.addController("/Hello",C1);
a1.start(9081).then( (server) => console.log("Server has started on PORT: 9081") );