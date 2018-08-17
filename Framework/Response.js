class Response
{
    constructor(res,buff)
    {
        this.res = res;
        this.buffer = buff;
    }

    append(str)
    {
        this.buffer.append(str);
    }   

    send()
    {
        this.res.end(this.buffer.get());
    }
    
    setHeader(p1,p2)
    {
        this.res.setHeader(p1,p2);
    }
}
module.exports = Response;