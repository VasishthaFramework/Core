const { Controller } = require("../../index");

class A1 extends Controller
{
    get(req,res)
    {
        res.setHeader('Content-Type','text/html');
        let msg = req.query.msg;
        let times = req.query.times;
        if(msg === undefined) msg = "Bye World!";
        if(times === undefined) times = 10;
        else times = parseInt(times);
        for(let i = 0;i < times;i++)
        {
            res.append("<h1>" + msg + "</h1>");
        }
        res.send();
    }
}

module.exports = { path:"/Bye" , controller:A1 };