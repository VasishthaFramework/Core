# Vashi
### A MVC Framework less than ~150 sloc for building Web Applications on Node.js

## Architecture
<img src="./vashi.svg">

### Example
#### C1 Controller
```javascript
class C1 extends Controller
{
    get(req,res)
    {
        res.setHeader('Content-Type','text/html');
        let msg = req.query.msg;
        let times = req.query.times;
        if(msg === undefined) msg = "Hello World!";
        if(times === undefined) times = 10;
        else times = parseInt(times);
        for(let i = 0;i < times;i++)
        {
            res.append("<h1>" + msg + "</h1>");
        }
        res.send();
    }
}
```
