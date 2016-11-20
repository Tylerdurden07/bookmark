bookMArkApp.controller('AddBookMarkController', ['$scope', '$location', '$rootScope', '$route', 'booksfactory', 'ngToast', function ($scope, $location, $rootScope, $route, booksfactory, ngToast) {

    // incase contoller executes befor angular run.
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
            // save this book mark under specific folder if choosen
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
            // display invalid toaster
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
