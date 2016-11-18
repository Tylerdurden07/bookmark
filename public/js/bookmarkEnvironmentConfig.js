bookMArkApp.config(function(envServiceProvider){

    envServiceProvider.config({
        domains:{
            development:['localhost','']
        },
        vars:{
            development:{
            RESTApiUrl:'https://desolate-taiga-92639.herokuapp.com'//http://localhost:8080'
            }
        }
    });

    envServiceProvider.check();
});
