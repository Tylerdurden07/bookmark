angular.module("bookMarkDashboard")
   .controller('MyBookmarkController', ['$scope', '$location', '$route', 'bookMarkFactory', 'helperFactory', function ($scope, $location, $route, bookMarkFactory, helperFactory) {


    // extract root folder bookmarks
    bookMarkFactory.GetUserBookMarks(userName).then(function(folders){
      $scope.UserFolders =folders;
      $scope.doNotDisplayApp=true;
      if($scope.UserFolders.length>0){
      $scope.doNotDisplayApp=false;
      }
      $scope.RootFolder=Enumerable.From(folders).Where(function(x) { return x.name==ROOTFOLDERSIGN}).FirstOrDefault();


      $scope.EditFolder = function (editFolderpath) {

          $location.path(editFolderpath);
      }

      $scope.EditBookmark = function (editBookMarkPath) {
          $location.path(editBookMarkPath);
      }

      $scope.DeleteFolder = function (folderIndex, folderId) {

          // delete this folder in mongoDb
          bookMarkFactory.DeleteFolder(folderIndex, folderId)
              .then(function (deletedFolder) {
                  helperFactory.Toaster(deletedFolder.name + ' Folder deleted Successfuly!', 'success');

                  $route.reload();
                  //$route.reload();
              }, function (error) {

              });


      }

      $scope.DeleteBookMark = function (folderIndex, BookmarkIndex) {
          var folderId = $scope.UserFolders[folderIndex]._id;
          var bookMarkId = $scope.UserFolders[folderIndex]
              .bookMarks[BookmarkIndex]._id;
          var bookMarkName=$scope.UserFolders[folderIndex]
              .bookMarks[BookmarkIndex].name;

          bookMarkFactory.DeleteBookMark(folderId, bookMarkId)
              .then(function (successFolder) {
                  helperFactory.Toaster(bookMarkName + ' BookMark deleted Successfully!', 'success');

                  $scope.UserFolders[folderIndex].bookMarks.splice(BookmarkIndex, 1);

                  $route.reload();

              }, function (error) {

              });


      }

      $scope.DeleteRootFolderBookMark = function (folderId, bookmarkIndex) {

          var bookMarkId = Enumerable.From($scope.UserFolders)
              .Where(function (x) {
                  return x._id == folderId
              })
              .FirstOrDefault().bookMarks[bookmarkIndex]._id;
          var BmName=Enumerable.From($scope.UserFolders)
              .Where(function (x) {
                  return x._id == folderId
              })
              .FirstOrDefault().bookMarks[bookmarkIndex].name;

          bookMarkFactory.DeleteBookMark(folderId, bookMarkId)
              .then(function (sucFolder) {

                /*  var bmName = Enumerable.From($scope.UserFolders)
                      .Where(function (x) {
                          return x._id == folderId
                      })
                      .FirstOrDefault().bookMarks[bookmarkIndex].name;*/
                  helperFactory.Toaster(BmName + ' BookMark deleted Successfully!', 'success');



                  Enumerable.From($scope.UserFolders)
                      .Where(function (x) {
                          return x._id == sucFolder._id
                      }).FirstOrDefault().bookMarks = sucFolder.bookMarks;

                  //$scope.RootFolder=Enumerable.From($scope.UserFolders).Where(function(x) { return x.name==ROOTFOLDERSIGN}).FirstOrDefault();
                  // check if the folder is ROOT and it has 0 bookmarks
                  if (sucFolder.name == ROOTFOLDERSIGN && sucFolder.bookMarks.length == 0) {
                      // issue a delete folder request fo this ROOT folder
                      var _folderIndex = $scope.UserFolders.indexOfRootFolder(sucFolder._id);

                      bookMarkFactory.DeleteFolder(_folderIndex, sucFolder._id).then(
                          function (deletionSuccess) {

                            $scope.UserFolders.splice(_folderIndex,1);
                            if($scope.UserFolders.length==0){
                            $route.reload();
                            }

                          },
                          function (error) {

                          });
                  }
                  $route.reload();


              }, function (error) {

              });

      }



    },function(error){

    });




    }]);
