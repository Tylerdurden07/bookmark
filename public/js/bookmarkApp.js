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

bookMArkApp.controller('AddBookMarkController', ['$scope', '$location', '$rootScope', '$route', 'booksfactory', 'ngToast', function ($scope, $location, $rootScope, $route, booksfactory, ngToast) {
    var unbindHandler = $rootScope.$on('init', function () {
        init();
        unbindHandler();
    });

    function init() {
        // populate folder drop down if any
        var availableFolderOptions = Enumerable.From($rootScope.UserFolders).Where(function (x) {
            return x.name != ROOTFOLDERSIGN
        }).ToArray();

        if (availableFolderOptions.length > 0) {
            $scope.disableFolderDropDown = false;

            $scope.availableFolder = $rootScope.availableFolder;
            $scope.newBookMarkFolder = Enumerable.From(availableFolderOptions).FirstOrDefault()._id;
            $scope.renderFolderSelect = true;
        }
    }


    //$scope.userFolders = $rootScope.UserFolders
    //disable the folder selection if there is no folder created by the user
    $scope.disableFolderDropDown = true;



    // populate folder drop down if any

    init();

    $scope.NavigateTo = function (path) {
        $location.path(path);

    }

    $scope.addBookMark = function (path, isValid) {

        if (isValid) {
            // get name url and folder
            var bookmarkName = $scope.newBookMarkName;
            var bookmarkUrl = $scope.newBookMarkUrl;
            var includeInfolder = $scope.includeinFolder;
            var includeUnderFolderId = $scope.newBookMarkFolder;

            var newBookMarkObj = {
                name: bookmarkName,
                url: bookmarkUrl
            };
            // save this book mark under specific folder if choosed
            if (!includeInfolder) {
                // check for the rootfolder
                var _rootItems = Enumerable.From($rootScope.UserFolders)
                    .Where(function (x) {
                        return x.name == ROOTFOLDERSIGN
                    })
                    .ToArray();
                if (_rootItems != undefined && Object.keys(_rootItems).length > 0) {
                    //root folder already exists
                    includeUnderFolderId = _rootItems._id;


                    booksfactory.UpdateFolderBookMarks(includeUnderFolderId, newBookMarkObj)
                        .then(function (updatedFolder) {
                            addSuccessToaster();
                            $location.path(path);
                            $route.reload();
                        }, function (error) {

                        });
                } else {
                    //create this bookmark by creating new root folder
                    var newRootFolder = {
                        name: ROOTFOLDERSIGN,
                        bookMarks: [],
                        userName: userName
                    };
                    newRootFolder.bookMarks.push(newBookMarkObj);
                    booksfactory.SaveUserFolderCreation(newRootFolder).then(
                        function () {
                            addSuccessToaster();
                            $location.path(path);
                            $route.reload();
                        },
                        function (error) {

                        });

                }

            } else {
                // case where bookmarks are being added to existing folders

                booksfactory.UpdateFolderBookMarks(includeUnderFolderId, newBookMarkObj)
                    .then(function (updatedFolder) {
                        addSuccessToaster();
                        $location.path(path);
                        $route.reload();

                    }, function (error) {

                    });
            }
        } else {
            // display a form invalid toaster
            ngToast.create({
                className: 'danger',
                content: 'Can not add!! invalid data!',
                timeout: ngToasterTimeOut,
                dismissButton: true
            });
        }


    }


    function addSuccessToaster() {
        ngToast.create({
            className: 'success',
            content: 'Created Successfully!',
            timeout: ngToasterTimeOut,
            dismissButton: true
        });
    }

    }]);


bookMArkApp.controller('AddFolderController', ['$rootScope', '$scope', '$location', '$routeParams', '$localStorage', 'booksfactory', 'ngToast', function ($rootScope, $scope, $location, $routeParams, $localStorage, booksfactory, ngToast) {

    //emoty folder object
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


bookMArkApp.filter('removeSpaces', [function () {
    return function (string) {
        if (!angular.isString(string)) {
            return string;
        }
        return string.replace(/[\s]/g, '');
    };
    }]);

bookMArkApp.directive('ngReallyClick', [function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.bind('click', function () {
                var message = attrs.ngReallyMessage;
                if (message && confirm(message)) {
                    scope.$apply(attrs.ngReallyClick);
                }
            });
        }
    }
    }]);

bookMArkApp.config(['$routeProvider',
      function ($routeProvider) {

        $routeProvider.when('/', {

            templateUrl: 'app/partialViews/AddBookMark.html',
            controller: 'AddBookMarkController'

        }).when('/createFolder/:fromEdit/:params', {

            templateUrl: 'app/partialViews/CreateFolder.html',
            controller: 'AddFolderController'

        }).when('/editFolder/:folderid', {

            templateUrl: 'app/partialViews/EditFolder.html',
            controller: 'EditFolderController'

        }).when('/editBookMark/:folderid/:bookMarkIndex/:includeInFolder', {

            templateUrl: 'app/partialViews/EditBookMark.html',
            controller: 'EditBookMarkController'
        }).when('/NoName', {

            templateUrl: 'app/partialViews/NoName.html'
        });


      }]);



function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}
