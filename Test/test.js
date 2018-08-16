const { V } = require("../index");
const C1 = require("./C1");
const app = new V();
app.addController("/Hello",C1);
app.start(9081).then( (server) => console.log("Server has started on PORT: 9081") );