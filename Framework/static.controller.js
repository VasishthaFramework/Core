const Controller = require('./Controller');
const fs = require('fs');
const path = require("path");
const mime = require('mime-types');

class StaticController extends Controller
{
    init(config)
    {
        const folder = config.folder;
        const abspath = path.resolve(folder);
        const files  = fs.readdirSync(folder);
        for(let file of files)
        {
            this.addFile({ path:file , filepath:`${abspath}/${file}` });
        }
        fs.watch(abspath, (event, file) => {
            if (event === 'rename') {
              const filepath = `${abspath}/${file}`;
              if (fs.existsSync(filepath)) {
                this.addFile({ path:file , filepath:filepath });
              } else {
                this.removeFile(`/${file}`);
              }
            }
          }
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