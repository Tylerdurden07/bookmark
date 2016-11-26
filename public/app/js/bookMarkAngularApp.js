// prompt user asking his username, if not given redirect him to no name view
var userName = prompt("enter your name?");

//Angular App
var bookMArkApp = angular.module('bookmark', ['BookMarkRoutes','environmentModule','sharedFactory','addBookMark'
,'addFolder','bookMarkDashboard','editBookMark','editFolder']);

//Get the master data in Run method and share the data across controller , this reduces number of hits to mongoDb
bookMArkApp.run(['$rootScope' , '$location', '$localStorage', function ($rootScope, $location, $localStorage) {
    $localStorage.$reset();
    if (userName) {
        $rootScope.userName=userName;
        $location.path('/');
    } else {
        $location.path('/NoName')
    }



}]);



/*
All Angular modules are implemented under
app/js/angular_modules folder , controllers are partitioned based on the view
design/user actions. considering both it is partitioned based on the
user actions since every action has got seperate view
*/
