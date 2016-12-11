define(["PDAppDir/two"],function(Two){
    var functionThree = function(){
        Two.functionTwo();
        console.log("I'm functionThree!");
    };

    return {
        functionThree:functionThree
    }
});