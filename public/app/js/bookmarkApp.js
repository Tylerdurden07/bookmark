// prompt user asking his username, if not given redirect him to no name view
var userName = prompt("enter your name?");

//javascript prototype
Array.prototype.indexOfRootFolder = function (folderId) {
    for (var i = 0; i < this.length; i++)
        if (this[i]._id === folderId)
            return i;
    return -1;
}

//CONSTANTS
var ngToasterTimeOut = 2000;
var ROOTFOLDERSIGN = 'ROOTFOLDER#';

//Angular App
var bookMArkApp = angular.module('bookmark', ['ngRoute', 'ngStorage', 'environment', 'ngToast', 'ngAnimate']);

//Get the master data in Run method and share the data across controller , this reduces number of hits to mongoDb
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



/*
All Angular App Controllers are implemented in seperate files under
app/controller folder , controllers are partitioned based on the view
design/user actions. considering both it is partitioned based on the
user actions since every action has got seperate view
*/


//Helper Function to clone any object
function clone(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
}