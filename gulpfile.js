const { dest, series, src, parallel, watch } = require("gulp");
const concat = require("gulp-concat");
const jshint = require("gulp-jshint");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const minify = require("gulp-minify");
const cleancss = require("gulp-clean-css");
const babel = require("gulp-babel");

function scss() {
    return src(["./src/scss/**/*.scss", "!./src/scss/_*/**"])
        .pipe(plumber())
        .pipe(
            rename(function (path) {
                if (path.basename.startsWith("_")) {
                    // remove _*.scss
                    path.basename = path.basename.slice(1);
                    // add prefix (parent folder + file name .scss)
                    path.basename = path.dirname + "-" + path.basename;
                }

                // dirname
                path.dirname = "./";
            })
        )
        .pipe(
            sass({
                outputStyle: "compressed",
            })
        )
        .pipe(sass().on("error", sass.logError))
        .pipe(dest("./assets"));
}

function minifyCss() {
    return src("./assets/*.css")
        .pipe(
            cleancss({
                compatibility: "ie8",
            })
        )
        .pipe(dest("./assets"));
}

/**** JS ****/
function compileJs() {
    return src(["./src/js/**/*.js"])
        .pipe(plumber())
        .pipe(
            rename(function (path) {
                if (path.dirname != ".") {
                    path.basename = path.dirname + "-" + path.basename;
                }

                // auto render all file in source folder without pareant folder
                path.dirname = "./";
            })
        )
        .pipe(
            babel({
                presets: ["@babel/env"],
            })
        )
        .pipe(
            minify({
                ext: {
                    min: ".js",
                },
                noSource: true,
            })
        )
        .pipe(dest("./assets"));
}

//======= Define complex task =======
//const js = series(compileJs);
// const css = series(scss, minifyCss);
const css = series(scss);

function watchFiles() {
    watch("src/scss/**/*", scss);
    watch("src/js/**/*", compileJs);
}

// Export file
exports.watch = watchFiles;
exports.css = css;
exports.default = css;
