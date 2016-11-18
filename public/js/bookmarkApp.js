
var userName = prompt("enter your name?");


var bookMArkApp = angular.module('bookmark', ['ngRoute', 'ngStorage','environment']);
bookMArkApp.run(['$rootScope','booksfactory','envService',function ($rootScope,booksfactory,envService) {

    booksfactory.GetUserBookMarks(userName);

}]);


bookMArkApp.controller('MyBookmarkController',['$scope','$location','$rootScope','booksfactory',function($scope,$location,$rootScope,booksfactory){




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

    $scope.DeleteFolder = function (folderIndex,folderId) {

        // delete this folder in mongoDb
        booksfactory.DeleteFolder(folderIndex,folderId)
        .then(function(deletedFolder){
        $location.path('/');
        },function(error){

        });


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
                        .Select(function (x) { return { 'folderName': x['name'], 'id': x['_id'] }; })
                        .ToArray();
        }
    }


}]);

bookMArkApp.controller('AddBookMarkController', ['$scope', '$location','$rootScope', 'booksfactory', function ($scope, $location,$rootScope,booksfactory) {


    //$scope.userFolders = $rootScope.UserFolders
    //disable the folder selection if there is no folder created by the user
    $scope.disableFolderDropDown = true;

    // populate folder drop down if any
    if ($rootScope.UserFolders.length > 0) {
        $scope.disableFolderDropDown = false;

        //$scope.availableFolder = $rootScope.availableFolder;
        $scope.newBookMarkFolder = Enumerable.From($rootScope.availableFolder).FirstOrDefault().id;
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
        var includeUnderFolderId = $scope.newBookMarkFolder;

        var newBookMarkObj={ name:bookmarkName,url:bookmarkUrl };
        // save this book mark under specific folder if choosed
        if(!includeInfolder){
            // check for the rootfolder
            var rootFolderKeys=Object.keys($rootScope.RootFolder);
            if(rootFolderKeys.length){
                //root folder already exists
                includeUnderFolderId=$rootScope.RootFolder._id;


            booksfactory.UpdateFolderBookMarks(includeUnderFolderId,newBookMarkObj)
            .then(function(updatedFolder){
               // refreshUIScopes();
                   $location.path(path);
            },function(error){

            });
            } else {
                //create this bookmark by creating new root folder
                var newRootFolder={ name:'ROOTFOLDER',bookMarks:[],userName:userName};
                newRootFolder.bookMarks.push(newBookMarkObj);
                booksfactory.SaveUserFolderCreation(newRootFolder).then(
                function(){
                  //  refreshUIScopes();
                    $location.path(path);
                },function(error){

                });

            }

        } else {
            // case where bookmarks are being added to existing folders

            booksfactory.UpdateFolderBookMarks(includeUnderFolderId,newBookMarkObj)
            .then(function(updatedFolder){
               // refreshUIScopes();
                   $location.path(path);
                $route.reload();
            },function(error){

            });
        }


    }


    function refreshUIScopes(){
        $scope.newBookMarkName='';
        $scope.newBookMarkUrl='';
        $scope.includeinFolder=false;
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
        newFolder.userName = userName;
        booksfactory.SaveUserFolderCreation(newFolder).then(function(){
                    // redirect based on the source where the event triggered.
            if($routeParams.fromEdit === 'true'){
                $localStorage.folderCreatedBeforEdit = newFolder.id;
                var redirectParams = $routeParams.params.split('|');
                var folderId = redirectParams[0];
                var bookMarkIndex = redirectParams[1];
                var includeInFolder = redirectParams[2]
                $location.path('/editBookMark/'+folderId+'/'+bookMarkIndex+'/'+includeInFolder);
            } else {

            $location.path(path);
            }
        },function(error){

        });

    }

}]);



bookMArkApp.controller('EditFolderController', ['$scope', '$location','$rootScope', '$routeParams', 'booksfactory', function ($scope, $location,$rootScope,$routeParams, booksfactory) {

    $scope.FolderNameToEdit = Enumerable.From($rootScope.UserFolders)
        .Where(function (x) { return x.id == $routeParams.folderid })
        .FirstOrDefault().name;



    $scope.editFolder = function (redirectPath) {
        // edit userfolders master collection and available folder collection
        Enumerable.From($rootScope.UserFolders)
         .Where(function (x) { return x.id == $routeParams.folderid })
         .FirstOrDefault().name = $scope.FolderNameToEdit;

        if ($rootScope.UserFolders.length) {
            $rootScope.availableFolder = Enumerable.From($rootScope.UserFolders)
                    .Select(function (x) { return { 'folderName': x['name'], 'id': x['_id'] }; })
                    .ToArray();
        }

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
            if ($rootScope.UserFolders.length) {
            $rootScope.availableFolder = Enumerable.From($rootScope.UserFolders)
                    .Select(function (x) { return { 'folderName': x['name'], 'id': x['_id'] }; })
                    .ToArray();
            }



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
