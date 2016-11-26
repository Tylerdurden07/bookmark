var folderDAL=require('./bookMarkDAL');

module.exports.getFolders = function(userName, callback){
  console.log("getting folder collection of a user");
  folderDAL.getFolders(userName, callback);
}

module.exports.saveFolder=function(requestBody,callback){
  console.log("saving a folder");
  folderDAL.saveFolder(requestBody,callback);
}

module.exports.deleteFolder=function(requestBody,callback){
  console.log("deleting a folder");
  folderDAL.deleteFolder(requestBody,callback);
}

module.exports.updateFolderBookMark=function(requestBody,callback){
  console.log("updating a folders bookmark");
  folderDAL.updateFolderBookMark(requestBody,callback);
}

module.exports.deleteBookMarkFromFolder=function(requestBody,callback){
  console.log("deleting a bookmark from folder");
  folderDAL.deleteBookMarkFromFolder(requestBody,callback);
}

module.exports.editFolder=function(requestBody,callback){
  console.log("editing a folder name");
  folderDAL.editFolder(requestBody,callback);
}
