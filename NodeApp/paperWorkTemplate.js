module.exports.folderPostTemplate=function(){
var folderObj={
  userName:String,
  name:String,
  bookMarks:[{name:String,url:String}]
}
  var folderPostTemplate = {
    folder: folderObj
  };


  return folderPostTemplate;
}

module.exports.putFolderBookMarkTemplate=function(){

  var putFolderBmObj={
    folderUpdate:{
        folderId:function(String){
          return String.length>20;
        },
        newBookMark: { name:String,url:String }
      }

  }

  return putFolderBmObj;
}

module.exports.putFolderTemplate=function(){

var putFolderTemplate={
  folderUpdate: {
      folderId: function(String){
        return String.length>20;
      },
      folderName:function(String){
        return (String.length>0 && /^[a-zA-Z0-9 ]*$/.test(String))
      }
  }
}

return putFolderTemplate;

}


module.exports.deleteFolderBookMarkPredicate=function(request){
  var folderUpdateObj =JSON.parse(request.query.folderUpdate);
  var inErrorState=(folderUpdateObj==undefined ||folderUpdateObj.folderId==undefined|| folderUpdateObj.folderId.length<20
    ||folderUpdateObj.bookMarkId==undefined||folderUpdateObj.bookMarkId.length<20);
  return inErrorState;
}


module.exports.deleteFolderPredicate=function(request){
 var inErrorState=(request.query.folderId==undefined||request.query.folderId.length<20);
 returm inErrorState;
}

module.exports.getFoldersPredicate=function(request){
  var inErrorState=(request.query.userName==undefined||request.query.userName.length==0);
  return inErrorState;
}
