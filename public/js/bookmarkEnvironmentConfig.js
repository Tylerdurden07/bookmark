bookMArkApp.config(function(envServiceProvider){

    envServiceProvider.config({
        domains:{
            development:['localhost','']
        },
        vars:{
            development:{
            RESTApiUrl:'http://localhost:8080'//'https://desolate-taiga-92639.herokuapp.com'
            }
        }
    });

    envServiceProvider.check();
});