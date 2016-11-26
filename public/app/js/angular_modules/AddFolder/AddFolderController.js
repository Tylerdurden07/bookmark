angular.module("addFolder")
.controller('AddFolderController', ['$scope', '$location', '$routeParams', '$localStorage', 'bookMarkFactory', 'helperFactory', function ($scope, $location, $routeParams, $localStorage, bookMarkFactory, helperFactory) {

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
            bookMarkFactory.SaveUserFolderCreation(newFolder).then(function () {
                helperFactory.Toaster('Created Successfully!', 'success');

                // redirect based on the source where the event triggered.
                if ($routeParams.fromEdit === 'true') {
                    $localStorage.folderCreatedBeforEdit = newFolder.id;
                    var redirectParams = $routeParams.params.split('|');
                    var folderId = redirectParams[0];
                    var bookMarkIndex = redirectParams[1];
                    var includeInFolder = redirectParams[2]
                    $location.path('/editBookMark/' + folderId + '/' + bookMarkIndex + '/' + includeInFolder);
                } else {
                    $localStorage.recentCreatedFolder = newFolder.id;

                    $location.path('/addBookMark');
                }
            }, function (error) {

            });
        } else {
            //display toaster not valid
            helperFactory.Toaster('Can not add!! Special characters not allowed', 'danger');

        }

    }

    }]);
