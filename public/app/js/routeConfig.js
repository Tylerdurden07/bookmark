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
