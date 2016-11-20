// helper methods that can be shared between controllers

bookMArkApp.factory('helperFactory', ['ngToast', function (ngToast) {

    var helperFactory = {};

    var _toaster = function (contentMessage,toasterType) {
        ngToast.create({
            className: toasterType,
            content: contentMessage,
            timeout: ngToasterTimeOut,
            dismissButton: true
        });
    }


    helperFactory.Toaster = _toaster;

    return helperFactory;

}]);
