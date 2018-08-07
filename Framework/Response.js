class Response
{
    constructor(res)
    {
        this.res = res;
        this.buffer = "";
    }

    append(str)
    {
        this.buffer += str;
    }   

    send()
    {
        this.res.end(this.buffer);
    }
    
    setHeader(p1,p2)
    {
        this.res.setHeader(p1,p2);
    }
}
module.exports = Response;