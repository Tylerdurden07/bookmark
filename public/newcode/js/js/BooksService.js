bookMArkApp.factory('booksfactory', ['$http', '$q', '$timeout', function ($http, $q, $timeout) {
    var booksFactory = {};

    var lstFolderObj = [{
        id: 1,
        userName: 'sekar',
        name: 'folderName',
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
    },
   {
       id: 2,
       userName: 'sekar',
       name: 'folderName two',
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
   },
    {
        id: 4,
        userName: 'sekar',
        name: 'ROOTFOLDER',
        bookMarks: [
            {
                name: 'rootgit',
                value: 'http://www.git.org'
            },
            {
                name: 'lennox',
                value: 'http://www.lennox.org'
            }
        ]
    }]



    var _getReportSummaryData = function (rtus, startDateMilliseconds) {
        var status_deferred = $q.defer();
        var requestUrl = _apiUrl + 'Reports/GetCustomReportSummaryData';

        var requestParamArrayObj = requestParam;
        requestParamArrayObj.isHVAC = true;
        requestParamArrayObj.Rtus = rtus;
        requestParamArrayObj.startDateMilliseconds = startDateMilliseconds;
        $http.post(requestUrl, requestParamArrayObj).
            success(function (data, status, headers, config) {
                status_deferred.resolve(data);
            }).error(function (errdata, status, header, config) {
                //requestData call failed, pass additional data with the reject call if needed
                status_deferred.reject(errdata);
            });

        return status_deferred.promise;
    }

    var _getUserBookMarks = function (userName) {
        console.log("service called");
        return lstFolderObj;


    }

    var _saveUserFolderCreation = function (folderObj) {
        lstFolderObj.push(folderObj);
    }

    var _saveBookMark = function (bookmarkName, url, folderId, userName) {

        // save this book mark under specific folder if choosed

    }



    booksFactory.GetUserBookMarks = _getUserBookMarks
    booksFactory.SaveUserFolderCreation = _saveUserFolderCreation;
    booksFactory.SaveBookMark = _saveBookMark;




    return booksFactory;

}]);
