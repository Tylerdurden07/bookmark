angular.module("environmentModule", [ 'environment'])
.config(function (envServiceProvider) {

    envServiceProvider.config({
        domains: {
            development: ['localhost', '']
        },
        vars: {
            development: {
                //RESTApiUrl: 'http://localhost:8080/api'
                RESTApiUrl: 'https://desolate-taiga-92639.herokuapp.com/api'
            }
        }
    });

    envServiceProvider.check();
});
