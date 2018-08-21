const { V } = require("../index");
const app = new V();
app.load("./controllers").static("./public").views("./views");
app.global.message = "Hello World!";
app.start(9081);