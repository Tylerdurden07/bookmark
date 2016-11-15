var express = require("express");
var mongoose=require('mongoose');
var path = require("path");
var bodyParser = require("body-parser");
//var mongodb = require("mongodb");
//var ObjectID = mongodb.ObjectID;

//var FOLDERS_COLLECTION = "folders";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, function(err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
});

// Create a model based on the schema
var Folder = mongoose.model('Folder', {name: String,bookmarks: Array});

mongoose.connection.on('connected', function(){

    console.log("mongo connected!!");
      // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });

});


// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}


app.get("/GetFolders", function(req, res) {
    // Find all data in the folders collection
    Folder.find(function (err, folders) {
    if (err) return console.error(err);
    console.log(folders);
    res.json(folders);
});
});

app.post('/PostFolder', function(req, res) {
  //  var folderName =JSON.parse( req.body.folderJson);
  //  res.send(JSON.stringify(folderName) );
    var folderParam=req.body.folder;
    //Lets create a new user
    var folderObj = new Folder({name: folderParam.name,bookmarks:folderParam.bookmarks});
    //save it
    folderObj.save(function (err, folder) {
    if (err) {
    console.log(err);
    } else {
    console.log('saved successfully:', folder);
    }
    });
    res.send(JSON.stringify(folder));
});


