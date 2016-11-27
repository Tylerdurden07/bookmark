var express = require("express");
var bodyParser = require("body-parser");
var NODE_PORT=process.env.PORT || 8080;
var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

//Including the routes module which is modularized ( Routes , DAL, Validation Templates , Controller ) under NodeApp Folder
var routes = require("./NodeApp/apiroutes");
routes(app);

//Starting up the server
app.listen(NODE_PORT, function(){
console.log('Server is up and running at port:'+NODE_PORT);
});
