const Controller = require("../Controller");

class Default extends Controller
{
    init(config)
    {
        this.message = config.message;
    }

    get(req,res)
    {
        res.setHeader("Content-Type","text/html");
        res.append("<meta charset='UTF-8'>");
        res.append(`<h1>${this.message}</h1>`);
        res.close();
    }
}

module.exports = { path:"*" , controller:Default , config:{ message:"404: No Such Controller 🤷" } };