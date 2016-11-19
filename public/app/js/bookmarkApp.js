var userName = prompt("enter your name?");

Array.prototype.indexOfRootFolder = function (folderId) {
    for (var i = 0; i < this.length; i++)
        if (this[i]._id === folderId)
            return i;
    return -1;
}

var ngToasterTimeOut = 2000;
var ROOTFOLDERSIGN = 'ROOTFOLDER#';


var bookMArkApp = angular.module('bookmark', ['ngRoute', 'ngStorage', 'environment', 'ngToast', 'ngAnimate']);
bookMArkApp.run(['$rootScope', 'booksfactory', 'envService', '$location', function ($rootScope, booksfactory, envService, $location) {

    if (userName) {
        booksfactory.GetUserBookMarks(userName).then(function () {
            $rootScope.$broadcast('init');

        }, function (error) {

        });
    } else {
        $rootScope.doNotDisplayApp = true;
        $location.path('/NoName')
    }



    }]);


bookMArkApp.controller('MyBookmarkController', ['$scope', '$location', '$rootScope', '$route', 'booksfactory', 'ngToast', function ($scope, $location, $rootScope, $route, booksfactory, ngToast) {


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
                ngToast.create({
                    className: 'success',
                    content: deletedFolder.name + ' Folder deleted Successfuly!',
                    timeout: ngToasterTimeOut,
                    animation: 'slide',
                    dismissButton: true
                });
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
                ngToast.create({
                    className: 'success',
                    content: bmName + ' BookMark deleted Successfully!',
                    timeout: ngToasterTimeOut,
                    dismissButton: true
                });

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
                ngToast.create({
                    className: 'success',
                    content: bmName + ' BookMark deleted Successfully!',
                    timeout: ngToasterTimeOut,
                    dismissButton: true
                });


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


    function updateAvailableFolders() {
        if ($rootScope.UserFolders.length > 0) {
            $rootScope.availableFolder = Enumerable.From($rootScope.UserFolders)
                .Select(function (x) {
                    return {
                        'folderName': x['name'],
                        'id': x['_id']
                    };
                })
                .ToArray();
        }
    }




    }]);






















function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}
