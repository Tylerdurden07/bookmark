bookMArkApp.controller('EditFolderController', ['$scope', '$location', '$rootScope', '$routeParams', 'booksfactory', 'ngToast', function ($scope, $location, $rootScope, $routeParams, booksfactory, ngToast) {

    var editableFolder = Enumerable.From($rootScope.UserFolders)
        .Where(function (x) {
            return x._id == $routeParams.folderid
        })
        .FirstOrDefault();

    $scope.FolderNameToEdit = editableFolder.name;
    var folderId = editableFolder._id;



    $scope.editFolder = function (redirectPath) {

        booksfactory.UpdateFolderName(folderId, $scope.FolderNameToEdit).then(function () {
            ngToast.create({
                className: 'success',
                content: 'Edited Successfully!',
                timeout: ngToasterTimeOut,
                dismissButton: true
            });
            $location.path(redirectPath);
        }, function (error) {

        });

    }
    }]);
