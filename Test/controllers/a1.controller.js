const { Controller } = require("../../index");

class A1 extends Controller
{
    get(req,res)
    {
        res.append("<h1> Entering A1 </h1>");
        res.append("<h1> Leaving A1 </h1>");
    }
}

module.exports = { path:"/Bye" , controller:A1 };