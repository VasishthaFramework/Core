const { Controller } = require("../../index");

class C1 extends Controller
{
    get(req,res)
    {
        res.setHeader('Content-Type','text/html');
        res.append("<h1> Entering C1 </h1>");
        res.view("two",{ msg:"Hello Goodbye!" });
        res.append("<h1> Leaving C1 </h1>");
    }
}

module.exports = { path:"/Hello" , controller:C1 };