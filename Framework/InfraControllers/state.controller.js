const Controller = require("../Controller");

class StateController extends Controller
{
    init(config)
    {
       // Can Configure the Container in Perm - Comb of CRUD 
       // ( Read Only, Update Only, Delete Only, Write Only, Read and Write, Read and Update .... )
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
