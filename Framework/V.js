// Dependancies
const http = require('http');
const fs = require('fs');
const path = require("path");
const url = require('url');
const qs = require('querystring');
const EventEmitter = require('events');
const cookie = require('cookie'); // Use this for Cookie Parsing!!!

// Framework
const Controller = require('./Controller');
const Request = require('./Request');
const Response = require('./Response');
const Buffer = require('./Buffer');
const staticcontroller = require('./static.controller');
const defaultcontroller = require('./default.controller');
const viewcontroller = require('./view.controller');

class V extends EventEmitter
{
    constructor()
    {
        super();
        this._server = null;
        this._mapping = {};
        this.global = {};
        this.addController(defaultcontroller);
    }

    load(folder = "./controllers")
    {
        const abspath = path.resolve(folder);
        const controllers  = fs.readdirSync(folder);
        for(let controller of controllers)
        {
            controller = controller.split(".");
            controller = controller.slice(0,controller.length-1).join(".");
            this.addController(require(`${abspath}/${controller}`));
        }
        fs.watch(abspath, (event, file) => {
            if (event === 'rename') {
              const filepath = `${abspath}/${file}`;
              file = file.split(".").slice(0,controller.length).join(".");
              if (fs.existsSync(filepath)) {
                this.addController(require(`${abspath}/${file}`));
              }
            }
          }
        );
        return this;
    }

    views(folder = "./views")
    {
        const conf = 
        {
            path: viewcontroller.path,
            controller: viewcontroller.controller,
            config: { folder:folder }
        };
        this.addController(conf);
        return this;
    }

    static(folder="./public")
    {
        const conf = 
        {
            path: staticcontroller.path,
            controller: staticcontroller.controller,
            config: { folder:folder }
        };
        this.addController(conf);
        return this;
    }

    addController({ path , controller , config })
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
            this._mapping[path] = controller; 
        }
        else
        {
            throw new Error("The Given Class Should be Instance of Controller");
        }
        return this;
    }

    removeController()
    {

    }

    getController(path)
    {
        if(path in this._mapping)
        {
            return this._mapping[path];
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
                const controller = this._mapping[route.pathname];
                let method = request.method;
                let body = '';
                request.on('data', (data) => body += data);
                request.on('end', () => route.post = qs.parse(body));
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
                resw.view = (name,data) => {
                    reqw.view = name;
                    reqw.data = data;
                    reqw.RequestDispatcher("view").forward(reqw,resw);
                }
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
                    const staticController = this._mapping["static"];
                    if(staticController != undefined && route.pathname in staticController.files)
                    {
                        console.log(`File: ${route.pathname}`);
                        staticController["get"](reqw,resw);
                    }
                    else
                    {
                        this._mapping["*"]["get"](reqw,resw);
                    }
                }
            }
        ).listen(this.port,'0.0.0.0');
        this.emit("Start",this._server);
        return Promise.resolve(this._server);
    }

}
module.exports = V;