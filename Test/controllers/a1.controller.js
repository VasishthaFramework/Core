const { Controller } = require("../../index");

class A1 extends Controller
{
    init(config)
    {
        this.message = config.message;
    }

    get(req,res)
    {
        res.append("<h1> A1 </h1>");
        res.close();
    }
}

module.exports = { path:"/Bye" , controller:A1 , config:{ message:"hello" } };