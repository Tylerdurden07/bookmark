bookMArkApp.factory('booksfactory', ['$http', '$q', '$timeout','$rootScope','envService', function ($http, $q, $timeout,$rootScope,envService) {

    var RESTApiBaseUrl=envService.read('RESTApiUrl');
    var booksFactory = {};
    $rootScope.UserFolders=[];
    $rootScope.availableFolder =[];
    $rootScope.RootFolder={};

    var _getUserBookMarksFromAPI = function (userName) {

        var status_deferred = $q.defer();
        var requestUrl = RESTApiBaseUrl+'/GetFolders';

        $http.get(requestUrl,{  params: { userName:userName}}).
            success(function (data, status, headers, config) {
            $rootScope.UserFolders=data;

             $rootScope.RootFolder = Enumerable.From($rootScope.UserFolders).Where(function (x) { return x.name == 'ROOTFOLDER' }).FirstOrDefault();
            if($rootScope.RootFolder==undefined){
            $rootScope.RootFolder={};
            }
            if ($rootScope.UserFolders.length > 0) {
            $rootScope.availableFolder = Enumerable.From($rootScope.UserFolders)
                    .Select(function (x) { return { 'folderName': x['name'], 'id': x['_id'] }; })
                    .ToArray();
            }
            status_deferred.resolve();
            }).error(function (errdata, status, header, config) {
                //requestData call failed, pass additional data with the reject call if needed
                status_deferred.reject(errdata);

            });

        return status_deferred.promise;

    }

    var _getUserBookMarks=function(userName){

        _getUserBookMarksFromAPI(userName).then(function(){

        },function(){});
        //return $rootScope.lstFolderObj;
    }

    var _saveUserFolderCreation = function (folderObj) {
        var status_deferred = $q.defer();
        // post this folderObj to mongoDb
        var postUrl=RESTApiBaseUrl+'/PostFolder';
        var postObj={ folder:folderObj};
        $http.post(postUrl,postObj)
        .success(function(successFolder){
            console.log(successFolder);
            $rootScope.UserFolders.push(successFolder);
            UpdateRootFolder();
            updateAvailableFolders();
            status_deferred.resolve();
        }).error(function(errdata, status, header, config){
            console.log("error saving folder");
            status_deferred.reject(errdata);
        });

         return status_deferred.promise;
    }

    var _saveBookMark = function (bookmarkName, bookmarkUrl, includeUnderFolder, userName) {



    }

    var _deleteFolder=function(folderIndex,folderId){
          var status_deferred = $q.defer();
         // post this folderObj to mongoDb
        var postUrl=RESTApiBaseUrl+'/DeleteFolder';
        var postObj={ folderId:folderId};
        $http.post(postUrl,postObj)
        .success(function(successFolder){
            console.log(successFolder);


        $rootScope.UserFolders.splice(folderIndex, 1);
        updateAvailableFolders();
        status_deferred.resolve(successFolder);
        }).error(function(errdata, status, header, config){
            console.log("error deleting folder");
            status_deferred.reject(errdata);
        });
          return status_deferred.promise;
    }

    var _updateFolderBookMarks=function(folderId,newBookMarkObject){

        var status_deferred = $q.defer();
         // post this folderObj to mongoDb
        var postUrl=RESTApiBaseUrl+'/UpdateFolderBookMark';
        var postObj={ folderUpdate: { folderId:folderId,newBookMark:newBookMarkObject  }};
        $http.post(postUrl,postObj)
        .success(function(successFolder){
            console.log("folder update success"+successFolder);
            Enumerable.From($rootScope.UserFolders)
            .Where(function (x) { return x._id ==successFolder._id }).FirstOrDefault().bookMarks=successFolder.bookMarks;
            UpdateRootFolder();
        status_deferred.resolve(successFolder);
        }).error(function(errdata, status, header, config){
            console.log("error deleting folder");
            status_deferred.reject(errdata);
        });
          return status_deferred.promise;
    };

    function updateAvailableFolders() {
        if ($rootScope.UserFolders.length > 0) {
            $rootScope.availableFolder = Enumerable.From($rootScope.UserFolders)
                        .Select(function (x) { return { 'folderName': x['name'], 'id': x['_id'] }; })
                        .ToArray();
        }
    }

    function UpdateRootFolder(){
        $rootScope.RootFolder = Enumerable.From($rootScope.UserFolders).Where(function (x) { return x.name == 'ROOTFOLDER' }).FirstOrDefault();
            if($rootScope.RootFolder==undefined){
            $rootScope.RootFolder={};
            }
    }



    booksFactory.GetUserBookMarks = _getUserBookMarks
    booksFactory.SaveUserFolderCreation = _saveUserFolderCreation;
    booksFactory.SaveBookMark = _saveBookMark;
    booksFactory.DeleteFolder=_deleteFolder;
    booksFactory.UpdateFolderBookMarks=_updateFolderBookMarks;




    return booksFactory;

}]);
