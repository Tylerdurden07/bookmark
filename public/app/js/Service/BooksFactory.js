//this factory interacts with the node rest api for all folder CRUD operations
bookMArkApp.factory('booksfactory', ['$http', '$q', '$timeout', '$rootScope', 'envService', function ($http, $q, $timeout, $rootScope, envService) {

    var RESTApiBaseUrl = envService.read('RESTApiUrl');
    var booksFactory = {};
    $rootScope.UserFolders = [];
    $rootScope.availableFolder = [];
    $rootScope.RootFolder = {};
    var UserFolders=[];
    var doneGettingFromDB=false;

    var _getUserBookMarks = function (userName) {

        var status_deferred = $q.defer();
        var requestUrl = RESTApiBaseUrl + '/Folders';

        $http.get(requestUrl, {
            params: {
                userName: userName
            }
        }).
        success(function (data, status, headers, config) {
            status_deferred.resolve(data);
        }).error(function (errdata, status, header, config) {
            //requestData call failed, pass additional data with the reject call if needed
            status_deferred.reject(errdata);

        });

        return status_deferred.promise;

    }


    var _saveUserFolderCreation = function (folderObj) {
        var status_deferred = $q.defer();
        // post this folderObj to mongoDb
        var postUrl = RESTApiBaseUrl + '/Folder';
        var postObj = {
            folder: folderObj
        };
        $http.post(postUrl, postObj)
            .success(function (successFolder) {
                console.log(successFolder);
                UserFolders.push(successFolder);
                status_deferred.resolve();
            }).error(function (errdata, status, header, config) {
                console.log("error saving folder");
                status_deferred.reject(errdata);
            });

        return status_deferred.promise;
    }



    var _deleteFolder = function (folderIndex, folderId) {
        var status_deferred = $q.defer();
        // post this folderObj to mongoDb
        var postUrl = RESTApiBaseUrl + '/Folder';

        $http.delete(postUrl, { params:{folderId: folderId}})
            .success(function (successFolder) {
              UserFolders.splice(UserFolders.indexOfRootFolder(folderId),1);
                console.log(successFolder);

                status_deferred.resolve(successFolder);
            }).error(function (errdata, status, header, config) {
                console.log("error deleting folder");
                status_deferred.reject(errdata);
            });
        return status_deferred.promise;
    }

    var _updateFolderBookMarks = function (folderId, newBookMarkObject) {

        var status_deferred = $q.defer();
        // post this folderObj to mongoDb
        var postUrl = RESTApiBaseUrl + '/FolderBookMark';
        var postObj = {
            folderUpdate: {
                folderId: folderId,
                newBookMark: newBookMarkObject
            }
        };
        $http.put(postUrl, postObj)
            .success(function (successFolder) {
                console.log("folder update success" + successFolder);
                Enumerable.From(UserFolders)
                    .Where(function (x) {
                        return x._id == successFolder._id
                    }).FirstOrDefault().bookMarks = successFolder.bookMarks;
                status_deferred.resolve(successFolder);
            }).error(function (errdata, status, header, config) {
                console.log("error deleting folder");
                status_deferred.reject(errdata);
            });
        return status_deferred.promise;
    };

    var _updateFolderName = function (folderId, folderName) {

        var status_deferred = $q.defer();
        // post this folderObj to mongoDb
        var postUrl = RESTApiBaseUrl + '/Folder';
        var postObj = {
            folderUpdate: {
                folderId: folderId,
                folderName: folderName
            }
        };
        $http.put(postUrl, postObj)
            .success(function (successFolder) {
                console.log("folder update success" + successFolder);
                Enumerable.From(UserFolders)
                    .Where(function (x) {
                        return x._id == successFolder._id
                    }).FirstOrDefault().name = successFolder.name;

                status_deferred.resolve(successFolder);
            }).error(function (errdata, status, header, config) {
                console.log("error deleting folder");
                status_deferred.reject(errdata);
            });
        return status_deferred.promise;
    };

    var _deleteBookMark = function (folderId, bookMarkId) {

        var status_deferred = $q.defer();
        var postUrl = RESTApiBaseUrl + '/FolderBookMark';

        $http.delete(postUrl, { params:{ folderUpdate: { folderId: folderId,  bookMarkId: bookMarkId} }})
            .success(function (successFolder) {
          var thisFolderBookMark=  Enumerable.From(UserFolders)
                            .Where(function(x) { return x._id==folderId})
                            .FirstOrDefault().bookMarks;
                            thisFolderBookMark.splice(thisFolderBookMark.indexOfRootFolder(bookMarkId),1 );
                console.log("bookmark deleted success" + successFolder);
                status_deferred.resolve(successFolder);
            }).error(function (errdata, status, header, config) {
                console.log("error deleting bookmark");
                status_deferred.reject(errdata);
            });
        return status_deferred.promise;
    }

    var _getFolders=function(userName){
        var status_deferred = $q.defer();
      if(!doneGettingFromDB){
        _getUserBookMarks(userName).then(
          function(folders){
            UserFolders=folders
            doneGettingFromDB=true;
            status_deferred.resolve(UserFolders);
          },function(error){
            status_deferred.reject(errdata);
          }
        )

      } else {
        status_deferred.resolve(UserFolders);
      }
      return status_deferred.promise;
    }



    booksFactory.GetUserBookMarks = _getFolders;
    booksFactory.SaveUserFolderCreation = _saveUserFolderCreation;
    booksFactory.DeleteFolder = _deleteFolder;
    booksFactory.UpdateFolderBookMarks = _updateFolderBookMarks;
    booksFactory.DeleteBookMark = _deleteBookMark;
    booksFactory.UpdateFolderName = _updateFolderName;




    return booksFactory;

}]);
