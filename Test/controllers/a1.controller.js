const { Controller } = require("../../index");

class A1 extends Controller
{
    init(config)
    {
        this.message = config.message;
    }

    get(req,res)
    {
        res.append("<h1> Entering A1 </h1>");
        const times = req.global.times;
        for(let i = 0; i < times;i++)
        {
            res.append("<h2>" + this.message + "</h2>");    
        }
        res.append("<h1> Leaving A1 </h1>");
    }
}

module.exports = { path:"/Bye" , controller:A1 , config:{ message:"hello" } };