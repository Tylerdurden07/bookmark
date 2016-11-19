var express = require("express");
var mongoose = require('mongoose');
var path = require("path");
var bodyParser = require("body-parser");
//var mongodb = require("mongodb");
//var ObjectID = mongodb.ObjectID;

//var FOLDERS_COLLECTION = "folders";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

var mangoDb = process.env.MONGODB_URI || 'mongodb://localhost/BookMarkApp';

mongoose.connect(mangoDb, function (err) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
});

// Create a model based on the schema
var bookMarkSchema = new mongoose.Schema({
    name: 'string',
    url: 'string'
});

var folderSchema = new mongoose.Schema({
    name: 'string',
    userName: 'string',
    bookMarks: [bookMarkSchema]
});


var Folder = mongoose.model('Folder', folderSchema);

mongoose.connection.on('connected', function () {

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
    res.status(code || 500).json({
        "error": message
    });
}


app.get("/GetFolders", function (req, res) {

    var userName = req.query.userName;
    // Find all folders associated with this user.
    Folder.find({
        userName: userName
    }, function (err, folders) {
        if (err) {
            throw err;
        } else {
            res.json(folders);
        }
    });

});

app.post('/PostFolder', function (req, res) {

    var folderParam = req.body.folder;
    //Lets create a new folder
    var folderObj = new Folder({
        name: folderParam.name,
        bookMarks: folderParam.bookMarks,
        userName: folderParam.userName
    });
    //save it
    folderObj.save(function (err, folder) {
        if (err) {
            console.log(err);
        } else {
            console.log('saved successfully:', folder);
            res.send(JSON.stringify(folder));
        }
    });

});


app.post('/DeleteFolder', function (req, res) {

    var folderId = req.body.folderId;

    Folder.findByIdAndRemove(folderId, function (err, folder) {
        if (err) {
            console.log(err);
        } else {
            res.json(folder);
            console.log("deleted folder.." + folder);
        }
    });

});

app.post('/UpdateFolderBookMark', function (req, res) {
    var folderUpdateObj = req.body.folderUpdate;

    Folder.findByIdAndUpdate(folderUpdateObj.folderId, {
        $push: {
            'bookMarks': folderUpdateObj.newBookMark
        }
    }, {
        'new': true
    }, function (err, folder) {

        if (err) {
            console.log("error in updating folder" + err);
        } else {
            console.log("folder updated !" + folder);
            res.json(folder);
        }
    });

});

app.post('/DeleteBookMarkFromFolder', function (req, res) {

    var folderUpdateObj = req.body.folderUpdate;

    Folder.findByIdAndUpdate(folderUpdateObj.folderId, {
        $pull: {
            'bookMarks': {
                _id: folderUpdateObj.bookMarkId
            }
        }
    }, {
        'new': true
    }, function (err, folder) {

        if (err) {
            console.log("error in updating folder" + err);
        } else {
            console.log("folder updated !" + folder);
            res.json(folder);
        }
    });

});

app.post('/EditFolder', function (req, res) {

    var folderUpdateObj = req.body.folderUpdate;

    Folder.findByIdAndUpdate(folderUpdateObj.folderId, {
        name: folderUpdateObj.folderName
    }, {
        'new': true
    }, function (err, folder) {

        if (err) {
            console.log("error in updating folder" + err);
        } else {
            console.log("folder updated !" + folder);
            res.json(folder);
        }
    });

});
