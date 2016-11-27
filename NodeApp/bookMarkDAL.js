var mongoose = require('mongoose');
var mongooseModels=require('./mongoose_models');
var mangoDb = process.env.MONGODB_URI || 'mongodb://localhost/BookMarkApp';
mongoose.connect(mangoDb, function (err) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
});


// Create a model based on the schema
var bookMarkSchema = new mongoose.Schema(mongooseModels.getBookMarkModel());

var folderSchema = new mongoose.Schema(mongooseModels.getFolderModel(bookMarkSchema));

var Folder = mongoose.model('Folder', folderSchema);

mongoose.connection.on('connected', function () {
    console.log("mongo connected!!");
});

module.exports.getFolders = function(userName, callback){
  Folder.find({
      userName: userName
  }, function (err, userFoldersObj) {
      if (err) throw err;
      callback(userFoldersObj);
  });
}

module.exports.saveFolder=function(requestBody,callback){
  var folderParam = requestBody.folder;
  //Lets create a new folder
  var folderObj = new Folder({
      name: folderParam.name,
      bookMarks: folderParam.bookMarks,
      userName: folderParam.userName
  });
  //save it
  folderObj.save(function (err, folder) {
      if (err) throw err;
      callback(JSON.stringify(folder));

  });
}


module.exports.deleteFolder=function(requestBody,callback){
  var folderId = requestBody.folderId;
  Folder.findByIdAndRemove(folderId, function (err, folder) {
      if (err) throw err;
      else {
      callback(folder);
    }

    });
  }


module.exports.updateFolderBookMark=function(requestBody,callback){
  var folderUpdateObj = requestBody.folderUpdate;
  Folder.findByIdAndUpdate(folderUpdateObj.folderId, {
      $push: {
          'bookMarks': folderUpdateObj.newBookMark
      }
  }, {
      'new': true
  }, function (err, folder) {
      if (err) throw err;
      callback(folder);
  });
}

module.exports.deleteBookMarkFromFolder=function(requestBody,callback){
  var folderUpdateObj =JSON.parse( requestBody.folderUpdate);
  Folder.findByIdAndUpdate(folderUpdateObj.folderId, {
      $pull: {
          'bookMarks': {
              _id: folderUpdateObj.bookMarkId
          }
      }
  }, {
      'new': true
  }, function (err, folder) {
          if (err){ console.log("error"+err); throw err; }
          callback(folder);

      }
    );
  }


module.exports.editFolder=function(requestBody,callback){
  var folderUpdateObj = requestBody.folderUpdate;

  Folder.findByIdAndUpdate(folderUpdateObj.folderId, {
      name: folderUpdateObj.folderName
  }, {
      'new': true
  }, function (err, folder) {

        if (err) throw err;
        callback(folder);
      }
  );
}
