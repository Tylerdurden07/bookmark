bookMArkApp.controller('EditBookMarkController', ['$scope', '$location', '$rootScope', '$routeParams', '$localStorage', 'booksfactory', 'ngToast', function ($scope, $location, $rootScope, $routeParams, $localStorage, booksfactory, ngToast) {

    $scope.EditableBmFolderName = Enumerable.From($rootScope.UserFolders)
        .Where(function (x) {
            return x._id == $routeParams.folderid
        })
        .FirstOrDefault();

    $scope.editBookMarkName = $scope.EditableBmFolderName.bookMarks[$routeParams.bookMarkIndex].name;
    $scope.editBookMarkUrl = $scope.EditableBmFolderName.bookMarks[$routeParams.bookMarkIndex].url;
    $scope.editIncludeinFolder = ($routeParams.includeInFolder === 'true');
    $scope.availableFolder = Enumerable.From($rootScope.UserFolders)
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
                    var rootFolderKeys = Object.keys($rootScope.RootFolder);
                    if (rootFolderKeys.length) {
                        destinationFolderId = $rootScope.RootFolder._id;
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
            var bookMarkId = Enumerable.From($rootScope.UserFolders)
                .Where(function (x) {
                    return x._id == $routeParams.folderid
                })
                .FirstOrDefault().bookMarks[$routeParams.bookMarkIndex]._id;
            booksfactory.DeleteBookMark($routeParams.folderid, bookMarkId)
                .then(function () {


                    Enumerable.From($rootScope.UserFolders)
                        .Where(function (x) {
                            return x._id == $routeParams.folderid
                        })
                        .FirstOrDefault().bookMarks.splice($routeParams.bookMarkIndex, 1);


                    // for root folder deletion incase if it has 0 bookmarks
                    var rootFldr = Enumerable.From($rootScope.UserFolders).Where(function (x) {
                            return x.name == ROOTFOLDERSIGN
                        })
                        .FirstOrDefault();
                    if (rootFldr != undefined && Object.keys(rootFldr).length) {
                        if (rootFldr._id == $routeParams.folderid && rootFldr.bookMarks.length == 0) {
                            // delete root folder
                            var rootFoldrIndex = $rootScope.UserFolders.indexOfRootFolder($routeParams.folderid);
                            booksfactory.DeleteFolder(rootFoldrIndex, $routeParams.folderid)
                                .then(function () {

                                }, function () {

                                });
                        }
                    }

                    // after successful deletion do the insert operation in desired folder


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
                        booksfactory.SaveUserFolderCreation(newRootFolder).then(
                            function () {

                                editedSuccessToaster();
                                $location.path(redirectPath);
                            },
                            function (error) {

                            });
                    } else {

                        // do normal bookmark insert into a folder operation

                        booksfactory.UpdateFolderBookMarks(destinationFolderId, newBookMarkObj)
                            .then(function (updatedFolder) {
                                editedSuccessToaster();
                                $location.path(redirectPath);
                            }, function (error) {

                            });

                    }




                }, function (error) {

                });








        } else {
            ngToast.create({
                className: 'danger',
                content: 'Can not add!! invalid data!',
                timeout: ngToasterTimeOut,
                dismissButton: true
            });
        }


    }


    $scope.CreateFolderFromEdit = function (path) {
        $location.path(path + '/true/' + $routeParams.folderid + '|' + $routeParams.bookMarkIndex + '|' + $routeParams.includeInFolder);
    }

    function editedSuccessToaster() {
        ngToast.create({
            className: 'success',
            content: 'Edited Successfully!',
            timeout: ngToasterTimeOut,
            dismissButton: true
        });
    }
    }]);
