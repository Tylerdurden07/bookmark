angular.module("editBookMark")
.controller('EditBookMarkController', ['$scope', '$location', '$routeParams', '$localStorage', 'bookMarkFactory', 'helperFactory', function ($scope, $location,  $routeParams, $localStorage, bookMarkFactory, helperFactory) {


    bookMarkFactory.GetUserBookMarks(userName).then(function(folders){
      $scope.UserFolders =folders;


      $scope.EditableBmFolderName = Enumerable.From($scope.UserFolders)
          .Where(function (x) {
              return x._id == $routeParams.folderid
          })
          .FirstOrDefault();

      $scope.editBookMarkName = $scope.EditableBmFolderName.bookMarks[$routeParams.bookMarkIndex].name;
      $scope.editBookMarkUrl = $scope.EditableBmFolderName.bookMarks[$routeParams.bookMarkIndex].url;
      $scope.editIncludeinFolder = ($routeParams.includeInFolder === 'true');
      $scope.availableFolder = Enumerable.From($scope.UserFolders)
          .Where(function (x) {
              return x.name != ROOTFOLDERSIGN
          })
          .ToArray();



      if (!$scope.editIncludeinFolder) {
          // assign default folder

          if ($scope.availableFolder != undefined && $scope.availableFolder.length > 0) {
              $scope.editBookMarkFolder = Enumerable.From($scope.availableFolder).FirstOrDefault()._id;
          } else {
              $scope.disableFolderDropDown = true;
          }


      } else {
          $scope.editBookMarkFolder = $scope.EditableBmFolderName._id;
      }


    },function(error){

    });



    $scope.editBookMark = function (redirectPath, isValid) {

        if (isValid) {
            // check if the folder is changed
            var destinationFolderId;
            var insertInRoot = false;
            if ($localStorage.folderCreatedBeforEdit == undefined) {
                if ($scope.editIncludeinFolder) {
                    destinationFolderId = $scope.editBookMarkFolder;
                } else {
                    // check root folder exist if not create under new root folder
                  var RootFolder=  Enumerable.From($scope.UserFolders)
                    .Where(function(x) { return x.name==ROOTFOLDERSIGN}).FirstOrDefault();
                    if (RootFolder!=undefined && Object.keys(RootFolder).length>0) {
                        destinationFolderId = RootFolder._id;
                    } else {
                        // create under newly created root folder
                        insertInRoot = true;
                    }


                }
            } else {
                destinationFolderId = $localStorage.folderCreatedBeforEdit;
                $localStorage.$reset();
            }
            // First Delete this book mark from old folder
            var bookMarkId = Enumerable.From(  $scope.UserFolders)
                .Where(function (x) {
                    return x._id == $routeParams.folderid
                })
                .FirstOrDefault().bookMarks[$routeParams.bookMarkIndex]._id;
            bookMarkFactory.DeleteBookMark($routeParams.folderid, bookMarkId)
                .then(function () {


                    Enumerable.From($scope.UserFolders)
                        .Where(function (x) {
                            return x._id == $routeParams.folderid
                        })
                        .FirstOrDefault().bookMarks.splice($routeParams.bookMarkIndex, 1);


                    // for root folder deletion incase if it has 0 bookmarks
                    var rootFldr = Enumerable.From($scope.UserFolders).Where(function (x) {
                            return x.name == ROOTFOLDERSIGN
                        })
                        .FirstOrDefault();

                        function InsertInDesiredFolder(){
                          var newBookMarkObj = {
                              name: $scope.editBookMarkName,
                              url: $scope.editBookMarkUrl
                          }
                          if (insertInRoot) {
                              //create this bookmark by creating new root folder
                              var newRootFolder = {
                                  name: ROOTFOLDERSIGN,
                                  bookMarks: [],
                                  userName: userName
                              };
                              newRootFolder.bookMarks.push(newBookMarkObj);
                              bookMarkFactory.SaveUserFolderCreation(newRootFolder).then(
                                  function () {

                                      helperFactory.Toaster('Edited Successfully!', 'success');
                                      $location.path(redirectPath);
                                  },
                                  function (error) {

                                  });
                          } else {

                              // do normal bookmark insert into a folder operation

                              bookMarkFactory.UpdateFolderBookMarks(destinationFolderId, newBookMarkObj)
                                  .then(function (updatedFolder) {
                                      helperFactory.Toaster('Edited Successfully!', 'success');

                                      $location.path(redirectPath);
                                  }, function (error) {

                                  });

                          }
                        }
                    if (rootFldr != undefined && Object.keys(rootFldr).length) {
                        if (rootFldr._id == $routeParams.folderid && rootFldr.bookMarks.length == 0) {
                            // delete root folder
                            var rootFoldrIndex =   $scope.UserFolders.indexOfRootFolder($routeParams.folderid);
                            bookMarkFactory.DeleteFolder(rootFoldrIndex, $routeParams.folderid)
                                .then(function () {
                                  if (!$scope.editIncludeinFolder) {
                                  insertInRoot=true;
                                }
                                  InsertInDesiredFolder();

                                }, function () {

                                });
                        } else {
                          InsertInDesiredFolder();
                        }
                    }

                    else {

                    // after successful deletion do the insert operation in desired folder
                    InsertInDesiredFolder();




                  }




                }, function (error) {

                });








        } else {
            helperFactory.Toaster('Can not add!! invalid data!', 'danger');

        }


    }


    $scope.CreateFolderFromEdit = function (path) {
        $location.path(path + '/true/' + $routeParams.folderid + '|' + $routeParams.bookMarkIndex + '|' + $routeParams.includeInFolder);
    }


    }]);
