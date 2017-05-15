'use strict';
var gulp = require('gulp'),
    webpack = require('webpack'),
    ora = require('ora'),
    gulpWebpack = require('webpack-stream'),
    watch = require('gulp-watch'),
    notify = require('gulp-notify'),
    clean = require('gulp-clean'),
//mergeStream = require('merge-stream'),
//    zip = require('zip-local'),
    path = require('path'),
    _ = require('lodash');

var app = require('./config/env');
const rootdir = app.rootdir;
//const zipPath = path.join(rootdir, '../baasbs.zip');
const distPath = app.dist;
console.log(distPath);

var tasks = {
    /**
     * 清除目录
     */
    'clean': {
        excute: function () {
            return gulp.src('dist/*', {read: false})
                .pipe(clean())
                .on('end', ()=> {
                    notify({message: '目录清理完成 - [dist/]'});
                });
        }
    },
    /**
     * 打包webpack dll文件
     */
    'compileDll': {
        excute: function () {
            let promise = new Promise(function (resolve, reject) {
                let compiler = webpack(require('./config/build/webpack.dll.conf.js'));
                compiler.run((err, stats)=> {
                    if (err) throw err;
                    resolve(stats);
                });
            });
            return promise;
        }
    },
    /**
     * webpack开发环境编译
     */
    'webpackdev': {
        excute: function () {
            gulp.src(path.resolve(rootdir, 'views/main.js'))
                .pipe(gulpWebpack(require('./config/build/webpack.dev.conf.js'), webpack))
                .pipe(gulp.dest(distPath));
        }
    },
    /**
     * webpack生成环境编译
     */
    'webpackprod': {
        excute: function () {
            return gulp.src(path.resolve(rootdir, 'views/main.js'))
                .pipe(gulpWebpack(require('./config/build/webpack.prod.conf.js'), webpack))
                .pipe(gulp.dest(distPath));
        }
    },
    /**
     * 项目打包-zip
     */
    'package': {
        excute: function () {
            //zip.sync.zip(rootdir).compress().save(zipPath);
        }
    }
};

function TaskExecuter(gulp, tasks) {
    if (!_.isObject(tasks)) {
        throw new Error('tasks is required!');
    }
    this._gulp = gulp;
    this._tasks = tasks;
}
/**
 * 执行任务
 */
TaskExecuter.prototype.excute = function () {
    var thiz = this,
        tasks = thiz._tasks,
        gulp = thiz._gulp,
        taskNameList = [],
        previousTask;
    //add task
    _.each(tasks, function (value, key) {
        gulp.add(key, previousTask && [previousTask], value['excute']); //name, dep, fn
        taskNameList.push(key);
        previousTask = key;
    });
    gulp.start.apply(gulp, taskNameList);
};

gulp.task('build:prod', function (cb) {
    let taskList = {
        clean: tasks.clean,
        dll: tasks.compileDll,
        prod: tasks.webpackprod
    };
    let executer = new TaskExecuter(gulp, taskList);
    executer.excute();
});

gulp.task('build:dev', function () {
    let taskList = {
        clean: tasks.clean,
        dll: tasks.compileDll,
        dev: tasks.webpackdev
    };
    let executer = new TaskExecuter(gulp, taskList);
    executer.excute();
});

//gulp.task('package', function () {
//    let taskList = {
//        clean: tasks.clean,
//        dll: tasks.compileDll,
//        prod: tasks.webpackprod,
//        package: tasks.package
//    };
//    let executer = new TaskExecuter(gulp, taskList);
//    executer.excute();
//});
