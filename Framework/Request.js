class Request 
{
    constructor(req,route)
    {
        this.req = req;
        this.method = req.method;
        this.url = req.url;
        this.query = route.query;
    }
}
module.exports = Request;