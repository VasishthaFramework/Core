// Dependancies
const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const qs = require('querystring');
const EventEmitter = require('events');
const cookie = require('cookie');
const chalk = require('chalk');

// Framework
const Controller = require('./Controller');
const Request = require('./Request');
const Response = require('./Response');
const Buffer = require('./Buffer');
const staticcontroller = require('./InfraControllers/static.controller');
const defaultcontroller = require('./InfraControllers/default.controller');
const viewcontroller = require('./InfraControllers/view.controller');
const Loader = require('./Loader');

class V extends EventEmitter
{
    constructor(disable = false,globalfile="global.json")
    {
        super();
        this._server = null;
        this.disable = disable;
        this._mapping = {};
        this.folder = path.resolve(".");
        this.global = {};
        this.global.folder = this.folder;
        // this.globals(globalfile);
        this.addController(defaultcontroller);
    }

    globals(filename)
    {
        const filepath = `${this.folder}/${filename}`;
        if(fs.existsSync(filepath))
        {
            const temp = JSON.parse(fs.readFileSync(filepath,{encoding:"utf-8"}));
            this.global = Object.assign(this.global, temp);
        }
    }

    load(folder = "./controllers")
    {
        this.loader = new Loader(folder);
        const add = (file,filepath) => this.addController(require(filepath));
        this.loader.start(
            add,
            add,
            (file,filepath) => {}
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
            throw new Error("The given class should be the subclass of Controller");
        }
        return this;
    }

    getController(path)
    {
        if(path in this._mapping)
        {
            return this._mapping[path];
        }
        throw new Error("No Such Controller");
    }

    start(port = 80,options=undefined)
    {
        this.port = port;
        const handler = (request,response) => {
            const route = url.parse(request.url, true);
            route.post = {};
            const cookies = cookie.parse(request.headers.cookie || '');
            const controller = this._mapping[route.pathname];
            let method = request.method;
            let body = '';
            request.on('data', (data) => body += data);
            request.on('end', () => route.post = qs.parse(body));
            method = method.toLowerCase();
            const reqw = new Request(request,route);
            reqw.global = this.global;
            reqw.cookies = cookies;
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
                if(!this.disable) console.log(chalk`{bold Controller:} {green ${route.pathname}}`);
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
                    if(!this.disable) console.log(chalk`{bold File:} {green ${route.pathname}}`);
                    staticController["get"](reqw,resw);
                }
                else
                {
                    this._mapping["*"]["get"](reqw,resw);
                }
            }
        };
        if(options == undefined)
        {
            this._server = http.createServer(handler);
        }
        else
        {
            this._server = https.createServer(options,handler);
        }
        this._server.listen(this.port,'0.0.0.0');
        this.emit("Start",this._server);
        if(!this.disable) console.log(chalk`{green Server has started on} {bold {red PORT: ${this.port}}}`);
        return Promise.resolve(this._server);
    }

}
module.exports = V;