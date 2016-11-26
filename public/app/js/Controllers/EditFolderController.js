bookMArkApp.controller('EditFolderController', ['$scope', '$location', '$routeParams', 'booksfactory', 'helperFactory', function ($scope, $location,  $routeParams, booksfactory, helperFactory) {
    booksfactory.GetUserBookMarks(userName).then(function(folders){
      $scope.UserFolders =folders;
      var editableFolder = Enumerable.From($scope.UserFolders)
          .Where(function (x) {
              return x._id == $routeParams.folderid
          })
          .FirstOrDefault();

      $scope.FolderNameToEdit = editableFolder.name;
      var folderId = editableFolder._id;

      $scope.editFolder = function (redirectPath, isValid) {
          if (isValid) {
              booksfactory.UpdateFolderName(folderId, $scope.FolderNameToEdit).then(function () {
                  helperFactory.Toaster('Edited Successfully!', 'success');

                  $location.path(redirectPath);
              }, function (error) {

              });
          } else {
              helperFactory.Toaster('Can not edit!! Special characters not allowed', 'danger');
          }

      }



    },function(error){

    });



    }]);
