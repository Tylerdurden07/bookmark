//this factory interacts with the node rest api for all folder CRUD operations
bookMArkApp.factory('booksfactory', ['$http', '$q', '$timeout', '$rootScope', 'envService', function ($http, $q, $timeout, $rootScope, envService) {

    var RESTApiBaseUrl = envService.read('RESTApiUrl');
    var booksFactory = {};
    $rootScope.UserFolders = [];
    $rootScope.availableFolder = [];
    $rootScope.RootFolder = {};

    var _getUserBookMarks = function (userName) {

        var status_deferred = $q.defer();
        var requestUrl = RESTApiBaseUrl + '/Folders';

        $http.get(requestUrl, {
            params: {
                userName: userName
            }
        }).
        success(function (data, status, headers, config) {
            $rootScope.UserFolders = data;

            $rootScope.RootFolder = Enumerable.From($rootScope.UserFolders).Where(function (x) {
                return x.name == ROOTFOLDERSIGN
            }).FirstOrDefault();
            if ($rootScope.RootFolder == undefined) {
                $rootScope.RootFolder = {};
            }
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

            status_deferred.resolve();
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
                $rootScope.UserFolders.push(successFolder);
                UpdateRootFolder();
                updateAvailableFolders();
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
                console.log(successFolder);


                $rootScope.UserFolders.splice(folderIndex, 1);
                updateAvailableFolders();
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
                Enumerable.From($rootScope.UserFolders)
                    .Where(function (x) {
                        return x._id == successFolder._id
                    }).FirstOrDefault().bookMarks = successFolder.bookMarks;
                UpdateRootFolder();
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
                Enumerable.From($rootScope.UserFolders)
                    .Where(function (x) {
                        return x._id == successFolder._id
                    }).FirstOrDefault().name = successFolder.name;
                updateAvailableFolders();

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
                console.log("bookmark deleted success" + successFolder);

                status_deferred.resolve(successFolder);
            }).error(function (errdata, status, header, config) {
                console.log("error deleting bookmark");
                status_deferred.reject(errdata);
            });
        return status_deferred.promise;
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

    function UpdateRootFolder() {
        $rootScope.RootFolder = Enumerable.From($rootScope.UserFolders).Where(function (x) {
            return x.name == ROOTFOLDERSIGN
        }).FirstOrDefault();
        if ($rootScope.RootFolder == undefined) {
            $rootScope.RootFolder = {};
        }
    }



    booksFactory.GetUserBookMarks = _getUserBookMarks
    booksFactory.SaveUserFolderCreation = _saveUserFolderCreation;
    booksFactory.DeleteFolder = _deleteFolder;
    booksFactory.UpdateFolderBookMarks = _updateFolderBookMarks;
    booksFactory.DeleteBookMark = _deleteBookMark;
    booksFactory.UpdateRootFolder = UpdateRootFolder;
    booksFactory.updateAvailableFolders = updateAvailableFolders;
    booksFactory.UpdateFolderName = _updateFolderName;




    return booksFactory;

}]);
