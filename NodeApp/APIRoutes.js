var folderController = require("./folder_controller");
var paperWorkTemplate=require("./paperworktemplate");
var paperWork=require('paperwork');

module.exports = function(app){
  
  //Get the details of the folder with the given username
  app.get('/api/Folders', function(req, res){
    if(paperWorkTemplate.getFoldersPredicate(req)){
      var error = {  status: 'bad_request',reason: 'Body did not satisfy requirements',errors: ['Invalid UserName']};
      res.status(400).send(error);
    } else {
      folderController.getFolders(req.query.userName, function(Folders){res.json(Folders);});
    }
  });

  //save the folder of particular user
  app.post('/api/Folder', paperWork.accept(paperWorkTemplate.folderPostTemplate()),function(req,res){
  folderController.saveFolder(req.body,function(folder){

    res.send((folder)); });
  });

  //delete a user's folder
  app.delete('/api/Folder',function(req,res){
    if(paperWorkTemplate.deleteFolderPredicate(req)){
      var error = {  status: 'bad_request',reason: 'Body did not satisfy requirements',errors: ['Invalid ID']};
      res.status(400).send(error);
    } else {
      folderController.deleteFolder(req.query,function(folder){res.json(folder);});
    }
  });


  //edits a folder's bookmark
  app.put('/api/FolderBookMark',paperWork.accept(paperWorkTemplate.putFolderBookMarkTemplate()),function(req,res){
    folderController.updateFolderBookMark(req.body,function(folder){ res.json(folder);});
  });

  //deletes a folder's bookmark
  app.delete('/api/FolderBookMark',function(req,res){
    if(paperWorkTemplate.deleteFolderBookMarkPredicate(req))
    {
      var error = {  status: 'bad_request',reason: 'Body did not satisfy requirements',errors: ['Invalid ID data']};
      res.status(400).send(error);
    } else {
    folderController.deleteBookMarkFromFolder(req.query,function(folder){res.json(folder);});
  }
  });

  //edits a folder
  app.put('/api/Folder',paperWork.accept(paperWorkTemplate.putFolderTemplate()),function(req,res){
    folderController.editFolder(req.body,function(folder){res.json(folder);});
  })



}
