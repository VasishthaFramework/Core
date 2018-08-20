const Controller = require('./Controller');
const Loader = require('./Loader');
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

class StaticController extends Controller
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
        path = "/" + path;
        this.files[path] = filepath; 
    }

    removeFile(path)
    {
        path = `/${path}`;
        delete this.files[path];
    }

    get(req,res)
    {
        if(this.files !== undefined)
        {
            const filepath = this.files[req.path];
            const data = fs.readFileSync(filepath).toString();
            const type = mime.contentType(path.extname(filepath));
            res.setHeader('Content-Type',type);
            res.append(data);
            res.close();
        }
    }
}

module.exports = { path:"static" , controller: StaticController };