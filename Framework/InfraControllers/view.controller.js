const Controller = require('../Controller');
const Loader = require('../Loader');
const fs = require('fs');
const ejs = require('ejs');

class ViewController extends Controller
{
    init(config)
    {
        const folder = config.folder;
        this.loader = new Loader(folder);
        const add = (file,filepath) => this.addFile({ path:file , filepath:filepath });
        this.loader.start( 
            add,
            add,
            (file,filepath) => this.removeFile(file)
        );
    }

    addFile({ path , filepath })
    {
        if(this.files === undefined) this.files = {};
        const mapping = {};
        path = path.split(".");
        let pathname = path.splice(0,path.length-1).join(".");
        let extension = path[path.length-1];
        mapping.path = pathname;
        mapping.filepath = filepath;
        if(extension == "ejs")
        {
            mapping.template = true;
        }
        else
        {
            mapping.template = false;
        }
        this.files[mapping.path] = mapping; 
    }

    removeFile(path)
    {
        path = path.split(".");
        let pathname = path.splice(0,path.length-1).join(".");
        delete this.files[pathname];
    }

    get(req,res)
    {
        if(this.files !== undefined)
        {
            if(req.view in this.files)
            {
                const mapping = this.files[req.view];
                const data = fs.readFileSync(mapping.filepath).toString();
                res.setHeader('Content-Type','text/html');
                if(mapping.template)
                {
                    res.append(ejs.render(data, req.data));
                }
                else
                {
                    res.append(data);
                }
                res.close();
            }
        }
    }
}

module.exports = { path:"view" , controller: ViewController };