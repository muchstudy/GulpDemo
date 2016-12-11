var gulp            = require('gulp');
var reqOptimize     = require('gulp-requirejs-optimize');   //- requireJs文件合并所需模块，选择该模块的原因为相对于其它模块活跃度较高
var rename          = require("gulp-rename");               //- 文件重命名
var rev             = require('gulp-rev');                  //- 对文件名加MD5后缀
var revCollector    = require('gulp-rev-collector');        //- 路径替换
var through2        = require('through2');                  //- 文件内容操作
var clean           = require('gulp-clean');                //- 删除文件
var runSequence     = require('run-sequence');              //- 同步执行任务

gulp.task("optimize",function () {
    gulp.src("app/main-build.js")
        .pipe(reqOptimize({
            optimize:"none",                                //- none为不压缩资源
            //findNestedDependencies: true,                 //- 解析嵌套中的require
            paths:{
                "PDAppDir":"",                              //- 所有文件的路径都相对于main-build.js，所以这里为空即可
                "jquery":"empty:"
            }
        }))
        .pipe(rename("main.min.js"))
        .pipe(gulp.dest('app'));                            //- 映射文件输出目录
});

gulp.task("md5",function (cb) {
    gulp.src("app/main-build.js")
        .pipe(reqOptimize({
            optimize:"none",                                //- none为不压缩资源
            //findNestedDependencies: true,                 //- 解析嵌套中的require
            paths:{
                "PDAppDir":"",                              //- 所有文件的路径都相对于main-build.js，所以这里为空即可
                "jquery":"empty:"
            }
        }))
        .pipe(rev())                                        //- 文件名加MD5后缀
        .pipe(gulp.dest("app"))                             //- 生成MD5后的文件
        .pipe(rev.manifest({merge:true}))                   //- 生成一个rev-manifest.json
        .pipe(gulp.dest(''))                                //- 映射文件输出目录
        .on('end', cb);
});

/************路径替换***********/
function modify(modifier) {
    return through2.obj(function(file, encoding, done) {
        var content = modifier(String(file.contents));
        file.contents = new Buffer(content);
        this.push(file);
        done();
    });
}
function replaceSuffix(data) {
    return data.replace(/\.js/gmi, "");
}
//去掉.js后缀，因为requirejs的引用一般都不带后缀
gulp.task("replaceSuffix",function (cb) {
    gulp.src(['rev-manifest.json'])
        .pipe(modify(replaceSuffix))            //- 去掉.js后缀
        .pipe(gulp.dest(''))
        .on('end', cb);
});

gulp.task("replaceHomePath",function (cb) {
    gulp.src(['rev-manifest.json', 'index-build.html'])
        .pipe(revCollector())                   //- 替换为MD5后的文件名
        .pipe(rename("index.html"))
        .pipe(gulp.dest(''))
        .on('end', cb);
});



//删除掉上一次构建时创建的资源
gulp.task("clean",function () {
    return gulp.src([
        'rev-manifest.json',
        '**/*-build-*.js',
        'index.html'
    ]).pipe(clean());
});

//构建总入口
gulp.task('default', function(callback) {
    runSequence(
        "clean",                //- 上一次构建的结果清空
        "md5",                  //- 文件合并与md5
        "replaceSuffix",        //- 替换.js后缀
        "replaceHomePath",      //- 首页路径替换为md5后的路径
        callback);
});