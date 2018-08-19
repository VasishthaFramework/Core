const Controller = require('./Controller');
const fs = require('fs');
const path = require("path");
const ejs = require('ejs');


class ViewController extends Controller
{
    init(config)
    {
        const folder = config.folder;
        const abspath = path.resolve(folder);
        const files  = fs.readdirSync(folder);
        let filepath = "";
        for(let file of files)
        {
            filepath = `${abspath}/${file}`;
            this.addFile({ name:file , filepath:filepath });
        }
        fs.watch(abspath, (event, file) => {
            if (event === 'rename') {
              const filepath = `${abspath}/${file}`;
              if (fs.existsSync(filepath)) {
                this.addFile({ name:file , filepath:filepath });
              } else {
                this.removeFile(name[0]);
              }
            }
          }
        );
    }

    addFile({ name , filepath })
    {
        if(this.files === undefined) this.files = {};
        const mapping = {};
        name = name.split(".").slice(0,name.length);
        mapping.name = name[0];
        mapping.filepath = filepath;
        if(name[1] == "ejs")
        {
            mapping.ejs = true;
        }
        else
        {
            mapping.ejs = false;
        }
        this.files[mapping.name] = mapping; 
    }

    removeFile(path)
    {
        delete this.files[path];
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
                if(mapping.ejs)
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