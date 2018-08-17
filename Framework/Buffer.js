class Buffer
{
    constructor()
    {
        this.buffer = "";
        this.closed = false;
    }

    append(str)
    {
        if(!this.closed) this.buffer += str;
    }

    close()
    {
        this.closed = true;
    }

    get()
    {
        return this.buffer;
    }

    set(val)
    {
        if(!this.closed) this.buffer = val;
    }
}
module.exports = Buffer;