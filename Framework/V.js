// Dependancies
const http = require('http');
const fs = require('fs');
const path = require("path");
const mime = require('mime-types');
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
            this.addController(require(`${abspath}/${controller}`));
        }
        return this;
    }

    static(folder="./public")
    {
        const abspath = path.resolve(folder);
        const files  = fs.readdirSync(folder);
        for(let file of files)
        {
            this.addFile({ path:file , filepath:`${abspath}/${file}` });
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

    addFile({ path , filepath })
    {
        if(this._static === undefined) this._static = {};
        path = "/" + path;
        this._static[path] = filepath; 
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
                if(this._static !== undefined)
                {
                    if(route.pathname in this._static)
                    {
                        const filepath = this._static[route.pathname];
                        const data = fs.readFileSync(filepath).toString();
                        const type = mime.contentType(path.extname(filepath));
                        response.setHeader('Content-Type',type);
                        response.end(data);
                        return;
                    }
                }
                route.post = {};
                const controller = this._controllers[route.pathname];
                const method = request.method;
                if (method != 'GET') {
                    var body = '';
                    request.on('data', (data) => body += data);
                    request.on('end', () => route.post = qs.parse(body));
                }
                if(controller != undefined)
                {
                    console.log(`Controller: ${route.pathname}`);
                    const reqw = new Request(request,route);
                    reqw.RequestDispatcher = (path) => {
                        const next = this.getController(path);
                        return { 
                            forward: (req,res) => {  
                                res.buffer = "";   
                                next[method.toLowerCase()](req,res);       
                            },
                            include: (req,res) => {
                                next[method.toLowerCase()](req,res);
                            }
                        }
                    }
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