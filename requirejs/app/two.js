define(["PDAppDir/one"],function(One){
    var functionTwo = function(){
        One.functionOne();
        console.log("I'm functionTwo!");
    };

    return {
        functionTwo:functionTwo
    }
});