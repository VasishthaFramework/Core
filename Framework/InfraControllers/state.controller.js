const Controller = require("../Controller");

class StateController extends Controller
{
    init(config)
    {
       // State Container Name to be provided
       // Transformers and Mutators
       // Rules Enforcers to initialized and Singular Level to the Container Level
    }

    get(req,res)
    {
        const op = String(req.query.operation).toLowerCase();
        switch(op)
        {
            case "create":break;
            case "read":break;
            case "update":break;
            case "delete":break;
            default:throw new Error("No Such Opertation! Only supports CRUD");
        }
    }

}

module.exports = { path:"state" , controller: StateController };
