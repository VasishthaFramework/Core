const fs = require('fs');
const path = require("path");

class Loader
{
    constructor(folder,dynamic = true)
    {   
        this.folder = folder;
        this.dynamic = dynamic;
    }

    start(onLoad,onCreate,onDelete,folder = this.folder)
    {
        const abspath = path.resolve(folder);
        const files  = fs.readdirSync(folder);
        let filepath = "";
        for(let file of files)
        {
            filepath = `${abspath}/${file}`;
            if(fs.lstatSync(filepath).isDirectory()) {
                this.start(onLoad,onCreate,onDelete,folder = filepath);
            }
            else {
                onLoad(file,filepath);
            }
        }
        if(this.dynamic)
        {
            fs.watch(abspath, (event, file) => {
                if (event === 'rename') {
                  const filepath = `${abspath}/${file}`;
                  if (fs.existsSync(filepath)) {
                    onCreate(file,filepath);
                  } else {
                    onDelete(file,filepath);
                  }
                }
              }
            );
        }
    }

}

module.exports = Loader;