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
        res.append("<h1>Hello World!</h1>");
        res.send();
    }
}
```
