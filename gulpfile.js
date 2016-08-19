var gulp = require("gulp");
var ts = require("gulp-typescript");
var tsProject = ts.createProject("tsconfig.json", {
  declaration: true,
});

var merge = require('merge2');

gulp.task("default", function() {
  var tsResult = tsProject.src() // instead of gulp.src(...)
    .pipe(ts(tsProject));

  return merge([
    tsResult.dts.pipe(gulp.dest("dist")),
    tsResult.js.pipe(gulp.dest("dist"))
  ]);
});
