const Controller = require("./Controller");

class C1 extends Controller
{
    get(req,res)
    {
        res.setHeader('Content-Type','text/html');
        for(let i = 0;i < 10;i++)
        {
            res.append("<h1>C1</h1>");
        }
        res.send();
    }
}

module.exports = C1