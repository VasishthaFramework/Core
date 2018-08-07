const Avayay = require("./Avayay");
const C1 = require("./C1");
const a1 = new Avayay();
a1.addController("/Hello",C1);
a1.start(9081).then( (server) => console.log("Server has started on PORT: 9081") );