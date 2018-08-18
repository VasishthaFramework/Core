// Dependancies
const http = require('http');
const fs = require('fs');
const path = require("path");
const mime = require('mime-types');
const url = require('url');
const qs = require('querystring');
const EventEmitter = require('events');
const cookie = require('cookie'); // Use this for Cookie Parsing!!!

// Framework
const Controller = require('./Controller');
const Request = require('./Request');
const Response = require('./Response');
const Buffer = require('./Buffer');

class V extends EventEmitter
{
    constructor()
    {
        super();
        this._server = null;
        // Combine all the mappings (Controllers,Static Files,Views) into one
        this._controllers = {};
        this._views = {};
        this.global = {};
    }

    load(folder = "./Controllers")
    {
        const abspath = path.resolve(folder);
        const controllers  = fs.readdirSync(folder);
        for(let controller of controllers)
        {
            controller = controller.split(".").slice(0,controller.length).join(".");
            this.addController(require(`${abspath}/${controller}`));
        }
        return this;
    }

    static(folder="./public")
    {
        // Refactoring
    }

    addController({ path , controller , config})
    {
        controller = new controller();
        if(controller instanceof Controller)
        {
            this.emit("ControllerAdded",controller);
            if(config != undefined)
            {
                controller.init(config);
            }
            else
            {
                controller.init({});
            }
            this._controllers[path] = controller; 
        }
        else
        {
            throw new Error("The Given Class Should be Instance of Controller");
        }
        return this;
    }

    getController(path)
    {
        if(path in this._controllers)
        {
            return this._controllers[path];
        }
        throw new Error("No Such Controller");
    }

    start(port = 80)
    {
        this.port = port;
        this._server = http.createServer(
            (request,response) => {
                const route = url.parse(request.url, true);
                route.post = {};
                const controller = this._controllers[route.pathname];
                let method = request.method;
                if (method != 'GET') {
                    let body = '';
                    request.on('data', (data) => body += data);
                    request.on('end', () => route.post = qs.parse(body));
                }
                method = method.toLowerCase();
                const reqw = new Request(request,route);
                reqw.global = this.global;
                reqw.RequestDispatcher = (path) => {
                    const next = this.getController(path);
                    return { 
                        forward: (req,res) => {   
                            if(method in controller)
                            {
                                res.buffer.set("");  
                                next[method](req,res);      
                                res.buffer.close();
                            } 
                        },
                        include: (req,res) => {
                            if(method in controller)
                            {
                                next[method](req,res);
                            }
                        }
                    }
                };
                const resw = new Response(response,new Buffer());
                if(controller != undefined)
                {
                    console.log(`Controller: ${route.pathname}`);
                    if(method in controller)
                    {
                        controller[method](reqw,resw);
                    }
                } 
                else
                {

                    const staticController = this._controllers["static"];
                    if(staticController != undefined)
                    {
                        if(route.pathname in staticController.files)
                        {
                            console.log(`File: ${route.pathname}`);
                            staticController["get"](reqw,resw);
                        }
                    }
                    response.setHeader("Content-Type","text/html");
                    response.end("<meta charset='UTF-8'> <h1>404: No Such Controller 🤷 </h1>");
                }
            }
        ).listen(this.port,'0.0.0.0');
        this.emit("Start",this._server);
        return Promise.resolve(this._server);
    }

}
module.exports = V;