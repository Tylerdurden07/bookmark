
var userName = prompt("enter your name?");


var bookMArkApp = angular.module('bookmark', ['ngRoute', 'ngStorage']);
bookMArkApp.run(['$rootScope','booksfactory',function ($rootScope,booksfactory) {
    $rootScope.UserFolders = booksfactory.GetUserBookMarks(userName);
    $rootScope.RootFolder = Enumerable.From($rootScope.UserFolders).Where(function (x) { return x.name == 'ROOTFOLDER' }).FirstOrDefault();

    if ($rootScope.UserFolders.length > 0) {
        $rootScope.availableFolder = Enumerable.From($rootScope.UserFolders)
                    .Select(function (x) { return { 'folderName': x['name'], 'id': x['id'] }; })
                    .ToArray();
    }
}]);


bookMArkApp.controller('MyBookmarkController',['$scope','$location','$rootScope','booksfactory',function($scope,$location,$rootScope,booksfactory){


    $scope.userFolders = $rootScope.UserFolders

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

    $scope.DeleteFolder = function (folderIndex) {
        $rootScope.UserFolders.splice(folderIndex, 1);
        updateAvailableFolders();
        $location.path('/');

    }

    $scope.DeleteBookMark = function (folderIndex, BookmarkIndex) {
        $rootScope.UserFolders[folderIndex].bookMarks.splice(BookmarkIndex, 1);
        updateAvailableFolders();
        $location.path('/');
    }

    $scope.DeleteRootFolderBookMark = function (bookmarkIndex) {

    }


    function updateAvailableFolders() {
        if ($rootScope.UserFolders.length > 0) {
            $rootScope.availableFolder = Enumerable.From($rootScope.UserFolders)
                        .Select(function (x) { return { 'folderName': x['name'], 'id': x['id'] }; })
                        .ToArray();
        }
    }


}]);

bookMArkApp.controller('AddBookMarkController', ['$scope', '$location','$rootScope', 'booksfactory', function ($scope, $location,$rootScope,booksfactory) {


    $scope.userFolders = $rootScope.UserFolders
    //disable the folder selection if there is no folder created by the user
    $scope.disableFolderDropDown = true;

    // populate folder drop down if any
    if ($scope.userFolders.length > 0) {
        $scope.disableFolderDropDown = false;

        $scope.availableFolder = $rootScope.availableFolder
        $scope.newBookMarkFolder = Enumerable.From($scope.availableFolder).FirstOrDefault().id;
        $scope.renderFolderSelect = true;
    }

    $scope.NavigateTo = function (path) {
        $location.path(path);

    }

    $scope.addBookMark = function (path) {
        // get name url and folder
        var bookmarkName = $scope.newBookMarkName;
        var bookmarkUrl = $scope.newBookMarkUrl;
        var includeInfolder = $scope.includeinFolder;
        var includeUnderFolder = $scope.newBookMarkFolder;
        booksfactory.SaveBookMark(bookmarkName, bookmarkUrl, includeUnderFolder, userName);

        $location.path(path);
    }

}]);


bookMArkApp.controller('AddFolderController', ['$rootScope', '$scope', '$location', '$routeParams','$localStorage', 'booksfactory', function ($rootScope,$scope, $location, $routeParams,$localStorage, booksfactory) {

    //emoty folder object
    var emptyFolder = {
        id: null,
        userName: null,
        name: null,
        bookMarks: []
    }

    $scope.newFolderName;

    $scope.createFolder = function (path) {
        //create folder object
        var newFolder = clone(emptyFolder);
        newFolder.name = $scope.newFolderName;
        newFolder.userName = $scope.userName;
        newFolder.id = Math.floor(Math.random() * 99) + 5;
        booksfactory.SaveUserFolderCreation(newFolder);

        $localStorage.folderCreatedBeforEdit = newFolder.id;

        if ($rootScope.UserFolders.length > 0) {
            $rootScope.availableFolder = Enumerable.From($rootScope.UserFolders)
                        .Select(function (x) { return { 'folderName': x['name'], 'id': x['id'] }; })
                        .ToArray();
        }
        // redirect based on the source where the event triggered.
        if($routeParams.fromEdit === 'true'){
            var redirectParams = $routeParams.params.split('|');
            var folderId = redirectParams[0];
            var bookMarkIndex = redirectParams[1];
            var includeInFolder = redirectParams[2]
            $location.path('/editBookMark/'+folderId+'/'+bookMarkIndex+'/'+includeInFolder);
        } else {

            $location.path(path);
        }


    }

}]);



bookMArkApp.controller('EditFolderController', ['$scope', '$location','$rootScope', '$routeParams', 'booksfactory', function ($scope, $location,$rootScope,$routeParams, booksfactory) {

    $scope.FolderNameToEdit = Enumerable.From($rootScope.UserFolders)
        .Where(function (x) { return x.id == $routeParams.folderid })
        .FirstOrDefault().name;



    $scope.editFolder = function (redirectPath) {
        Enumerable.From($rootScope.UserFolders)
         .Where(function (x) { return x.id == $routeParams.folderid })
         .FirstOrDefault().name = $scope.FolderNameToEdit;

        $location.path(redirectPath);
    }
}]);

bookMArkApp.controller('EditBookMarkController', ['$scope', '$location', '$rootScope', '$routeParams','$localStorage', 'booksfactory', function ($scope, $location, $rootScope, $routeParams,$localStorage, booksfactory) {

    $scope.EditableBmFolderName = Enumerable.From($rootScope.UserFolders)
        .Where(function (x) { return x.id == $routeParams.folderid })
        .FirstOrDefault();

    $scope.editBookMarkName = $scope.EditableBmFolderName.bookMarks[$routeParams.bookMarkIndex].name;
    $scope.editBookMarkUrl = $scope.EditableBmFolderName.bookMarks[$routeParams.bookMarkIndex].value;
    $scope.editIncludeinFolder = ($routeParams.includeInFolder === 'true');
    $scope.availableFolder = $rootScope.availableFolder;
    if ($scope.EditableBmFolderName.id != $rootScope.RootFolder.id) {
        $scope.editBookMarkFolder = $scope.EditableBmFolderName.id;
    } else {
        $scope.editBookMarkFolder = Enumerable.From($rootScope.availableFolder).FirstOrDefault().id;
    }


    $scope.editBookMark = function (redirectPath) {
        // check if the folder is changed
        var destinationFolderId;
        if ($localStorage.folderCreatedBeforEdit==undefined) {
            if ($scope.editIncludeinFolder) {
                destinationFolderId = $scope.editBookMarkFolder;
            } else {
                destinationFolderId = $rootScope.RootFolder.id;

            }
        }
        else {
            destinationFolderId = $localStorage.folderCreatedBeforEdit;
            $localStorage.$reset();
        }
            // remove the bookmark from old folder
            Enumerable.From($rootScope.UserFolders)
                .Where(function (x) { return x.id == $routeParams.folderid })
                .FirstOrDefault().bookMarks.splice($routeParams.bookMarkIndex, 1);



            var bookMark = { name: $scope.editBookMarkName, value: $scope.editBookMarkUrl };
            Enumerable.From($rootScope.UserFolders)
                    .Where(function (x) { return x.id == destinationFolderId })
                    .FirstOrDefault().bookMarks.push(bookMark);


            $location.path(redirectPath);


    }


    $scope.CreateFolderFromEdit = function (path) {
        $location.path(path + '/true/' + $routeParams.folderid + '|' + $routeParams.bookMarkIndex + '|' + $routeParams.includeInFolder);
    }
}]);

bookMArkApp.controller('BookMarkCtrl', function ($scope, $location) {

    $scope.userName = userName;


    //emoty folder object
    var emptyFolder = {
        id: null,
        userName: null,
        name: null,
        bookMarks: null
    }



    var lstFolderObj = [{
        id:1,
        userName:'sekar',
        name:'folderName',
        bookMarks:[
            {
                name:'git',
                value:'http://www.git.org'
            },
            {
                name:'lennox',
                value:'http://www.lennox.org'
            }
        ]
    },
    {
        id: 2,
        userName:'sekar',
        name:'folderName two',
        bookMarks:[
            {
                name:'git',
                value:'http://www.git.org'
            },
            {
                name:'lennox',
                value:'http://www.lennox.org'
            }
        ]
    },
    {
        id: 3,
        userName: 'sekar',
        name: 'folderName three',
        bookMarks: [
            {
                name: 'git',
                value: 'http://www.git.org'
            },
            {
                name: 'lennox',
                value: 'http://www.lennox.org'
            }
        ]
    }]

    $scope.userFolders = lstFolderObj;


    // UI scope variable

    //disable the folder selection if there is no folder created by the user
    $scope.disableFolderDropDown = true;

    // populate folder drop down if any
    if ($scope.userFolders.length > 0) {
        $scope.disableFolderDropDown = false;

        $scope.availableFolder = Enumerable.From($scope.userFolders)
                    .Select(function (x) { return { 'folderName': x['name'], 'id': x['id'] }; })
                    .ToArray();
        $scope.defaultFolder = Enumerable.From($scope.availableFolder).FirstOrDefault().id;
        $scope.renderFolderSelect = true;
    }

    $scope.NavigateTo = function (path) {
        $location.path(path);


    }


    // create folder

    $scope.newFolderName;

    $scope.createFolder = function (path) {
        //create folder object
        var newFolder = clone(emptyFolder);
        newFolder.name = $scope.newFolderName;
        newFolder.userName = $scope.userName;
        newFolder.id = Math.floor(Math.random() * 99) + 5;
        $scope.userFolders.push(newFolder);
        $location.path(path);

    }

});

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

          templateUrl: 'app/directives/AddBookMark.html',
          controller: 'AddBookMarkController'

      }).when('/createFolder/:fromEdit/:params', {

          templateUrl: 'app/directives/CreateFolder.html',
          controller: 'AddFolderController'

      }).when('/editFolder/:folderid', {

          templateUrl: 'app/directives/EditFolder.html',
          controller: 'EditFolderController'

      }).when('/editBookMark/:folderid/:bookMarkIndex/:includeInFolder', {

          templateUrl: 'app/directives/EditBookMark.html',
          controller: 'EditBookMarkController'
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
