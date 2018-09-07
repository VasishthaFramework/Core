class Request 
{
    constructor(req,route)
    {
        this.req = req;
        this.method = req.method;
        this.url = req.url;
        this.query = route.query;
        this.body = route.post;
        this.path = route.pathname;
    }

    param(name)
    {
        if(name in this.query) return this.query[name];
        else if(name in this.body) return this.body[name];
        return null;
    }
}
module.exports = Request;