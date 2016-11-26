var folderController = require("./folder_controller");

module.exports = function(app){
  //Get the details of the folder with the given username
  app.get('/api/Folders', function(req, res){
  folderController.getFolders(req.query.userName, function(Folders){res.json(Folders);});
  });

  //save the folder of particular user
  app.post('/api/Folder',function(req,res){
  folderController.saveFolder(req.body,function(folder){

    res.send((folder)); });
  });

  //delete a user's folder
  app.delete('/api/Folder',function(req,res){
  folderController.deleteFolder(req.query,function(folder){
     res.json(folder);});
  });

  //edits a folder's bookmark
  app.put('/api/FolderBookMark',function(req,res){
    folderController.updateFolderBookMark(req.body,function(folder){ res.json(folder);});
  });

  //deletes a folder's bookmark
  app.delete('/api/FolderBookMark',function(req,res){
    folderController.deleteBookMarkFromFolder(req.query,function(folder){res.json(folder);});
  });

  //edits a folder
  app.put('/api/Folder',function(req,res){
    folderController.editFolder(req.body,function(folder){res.json(folder);});
  })



}
