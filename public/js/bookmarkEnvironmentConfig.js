bookMArkApp.config(function(envServiceProvider){

    envServiceProvider.config({
        domains:{
            development:['localhost','']
        },
        vars:{
            development:{
            RESTApiUrl:'https://desolate-taiga-92639.herokuapp.com'//'https://desolate-taiga-92639.herokuapp.com'
            }
        }
    });

    envServiceProvider.check();
});
