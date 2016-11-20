bookMArkApp.controller('AddFolderController', ['$rootScope', '$scope', '$location', '$routeParams', '$localStorage', 'booksfactory', 'ngToast', function ($rootScope, $scope, $location, $routeParams, $localStorage, booksfactory, ngToast) {

    //empty folder object
    var emptyFolder = {
        id: null,
        userName: null,
        name: null,
        bookMarks: []
    }

    $scope.newFolderName;

    $scope.createFolder = function (path, isValid) {
        if (isValid) {
            //create folder object
            var newFolder = clone(emptyFolder);
            newFolder.name = $scope.newFolderName;
            newFolder.userName = userName;
            booksfactory.SaveUserFolderCreation(newFolder).then(function () {
                ngToast.create({
                    className: 'success',
                    content: 'Created Successfully!',
                    timeout: ngToasterTimeOut,
                    dismissButton: true
                });
                // redirect based on the source where the event triggered.
                if ($routeParams.fromEdit === 'true') {
                    $localStorage.folderCreatedBeforEdit = newFolder.id;
                    var redirectParams = $routeParams.params.split('|');
                    var folderId = redirectParams[0];
                    var bookMarkIndex = redirectParams[1];
                    var includeInFolder = redirectParams[2]
                    $location.path('/editBookMark/' + folderId + '/' + bookMarkIndex + '/' + includeInFolder);
                } else {

                    $location.path(path);
                }
            }, function (error) {

            });
        } else {
            //display toaster not valid
            ngToast.create({
                className: 'danger',
                content: 'Can not add!! invalid data!',
                timeout: ngToasterTimeOut,
                dismissButton: true
            });
        }

    }

    }]);
