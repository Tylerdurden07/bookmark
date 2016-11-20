bookMArkApp.controller('MyBookmarkController', ['$scope', '$location', '$rootScope', '$route', 'booksfactory', 'helperFactory', function ($scope, $location, $rootScope, $route, booksfactory, helperFactory) {


    // extract root folder bookmarks
    $scope.rootfolderItems = $rootScope.RootFolder;
    if ($scope.rootfolderItems.length) {
        $rootScope.rootFolderId = $scope.rootfolderItems.id;
    }


    $scope.EditFolder = function (editFolderpath) {

        $location.path(editFolderpath);
    }

    $scope.EditBookmark = function (editBookMarkPath) {
        $location.path(editBookMarkPath);
    }

    $scope.DeleteFolder = function (folderIndex, folderId) {

        // delete this folder in mongoDb
        booksfactory.DeleteFolder(folderIndex, folderId)
            .then(function (deletedFolder) {
            helperFactory.Toaster(deletedFolder.name + ' Folder deleted Successfuly!','success');

                $location.path('/');
                $route.reload();
            }, function (error) {

            });


    }

    $scope.DeleteBookMark = function (folderIndex, BookmarkIndex) {
        var folderId = $rootScope.UserFolders[folderIndex]._id;
        var bookMarkId = $rootScope.UserFolders[folderIndex]
            .bookMarks[BookmarkIndex]._id;

        booksfactory.DeleteBookMark(folderId, bookMarkId)
            .then(function (successFolder) {

                var bmName = $rootScope.UserFolders[folderIndex].bookMarks[BookmarkIndex].name;
            helperFactory.Toaster(bmName + ' BookMark deleted Successfully!','success');

                $rootScope.UserFolders[folderIndex].bookMarks.splice(BookmarkIndex, 1);

                $location.path('/');

            }, function (error) {

            });


    }

    $scope.DeleteRootFolderBookMark = function (folderId, bookmarkIndex) {

        var bookMarkId = Enumerable.From($rootScope.UserFolders)
            .Where(function (x) {
                return x._id == folderId
            })
            .FirstOrDefault().bookMarks[bookmarkIndex]._id;

        booksfactory.DeleteBookMark(folderId, bookMarkId)
            .then(function (sucFolder) {

                var bmName = Enumerable.From($rootScope.UserFolders)
                    .Where(function (x) {
                        return x._id == folderId
                    })
                    .FirstOrDefault().bookMarks[bookmarkIndex].name;
            helperFactory.Toaster(bmName + ' BookMark deleted Successfully!','success');



                Enumerable.From($rootScope.UserFolders)
                    .Where(function (x) {
                        return x._id == sucFolder._id
                    }).FirstOrDefault().bookMarks = sucFolder.bookMarks;
                booksfactory.UpdateRootFolder();
                // check if the folder is ROOT and it has 0 bookmarks
                if (sucFolder.name == ROOTFOLDERSIGN && sucFolder.bookMarks.length == 0) {
                    // issue a delete folder request fo this ROOT folder
                    var _folderIndex = $rootScope.UserFolders.indexOfRootFolder(sucFolder._id);

                    booksfactory.DeleteFolder(_folderIndex, sucFolder._id).then(
                        function (deletionSuccess) {

                        },
                        function (error) {

                        });
                }


            }, function (error) {

            });

    }







    }]);





