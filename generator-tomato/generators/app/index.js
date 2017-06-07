'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const mkdirp = require('mkdirp');
const mustache = require('mustache');
const fs = require('fs');
const path = require('path');
const lodash = require('lodash/collection');

/**
 * 配置需要转换编译的模板文件
 */
const MUSTACHE_CONF = {
    '.package.json.mustache': 'package.json',
    '.pm2.json.mustache': 'pm2.json',
    'views/.index.html.mustache': 'views/index.html',
    'config/env/.base.conf.js.mustache': 'config/env/base.conf.js'
};

/**
 * 编译mustache
 * @param src 源文件
 * @param dest 输出文件
 * @param self Generator实例
 * @private
 */
function _compileMustache(src, dest, self) {
    let thiz = self,
        tpl = thiz.templatePath(),
        to = thiz.destinationPath();
    let code = mustache.render(
        fs.readFileSync(path.join(tpl, src), 'utf-8'),
        thiz.options.answers
    );
    fs.writeFileSync(path.join(to, dest), code);
}

/**
 * 根据文件完整路径取出文件所在目录
 * @param fileFullPath
 * @returns {Array|*}
 * @private
 */
function _cutFilePath(fileFullPath) {
    let tempArr = fileFullPath.split(path.sep);
    tempArr.splice(tempArr.length - 1, 1);
    return tempArr.join(path.sep);
}

/**
 * 文件拷贝
 * @param filePath 源文件路径
 * @param self Generator实例
 * @private
 */
function _copy(filePath, self) {
    let relativeFilePath = path.relative(self.templatePath(), filePath);
    let destPath = self.destinationPath(relativeFilePath);
    mkdirp.sync(_cutFilePath(destPath));
    fs.writeFileSync(
        destPath,
        fs.readFileSync(filePath, 'utf-8')
    );
    self.log(`${chalk.green('Create')} ${relativeFilePath}`);
}

function _scanner(filePath, self) {
    let thiz = self;
    let fileList = fs.readdirSync(filePath);
    fileList.forEach(filename=> {
        if (!fs.lstatSync(path.join(filePath, filename)).isDirectory()) {
            // 若为文件
            _copy(path.join(filePath, filename), thiz);
        } else {
            // 若为文件夹
            _scanner(path.join(filePath, filename), thiz);
        }
    });
}

/**
 * 匿名类
 * @Refs http://yeoman.io/authoring/user-interactions.html
 */
module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this.log(yosay(`Welcome to use ${chalk.red('generator-tomato')}!`));
    }

    prompting() {
        return this.prompt([{
            type: 'input',
            name: 'appname',
            message: 'Your project name',
            validate: function (input) {
                let flag = /^[a-z|A-Z]+\w$/.test(input);
                if (flag) {
                    return true;
                }
                return `Project should consist of [${chalk.red('a-z A-Z 0-9 _')}]`;
            },
            default: this.appname // Default to current folder name
        }, {
            type: 'input',
            name: 'apppath',
            message: `Logic path(eg. http://HOST:PORT/${chalk.red('LOGIC_PATH')}/)`,
            validate: function (input) {
                let value = input.replace(/^\//g, '');
                let flag = /^[a-z|A-Z]+\w$/.test(value);
                if (flag) {
                    return true;
                }
                return `Logic path should consist of [${chalk.red('a-z A-Z 0-9 _')}]`;
            },
            filter: function (input) {
                if (/^\//.test(input)) {
                    return input;
                }
                return ['/', input].join('');
            },
            default: `/${this.appname}` // Default to current folder name
        }, {
            type: 'confirm',
            name: 'install',
            message: 'Would you like to install dependency automaticlly?',
            default: false // Default to false
        }]).then((answers) => {
            this.log('------------------------------');
            this.log('App name:', chalk.magenta(answers.appname));
            this.log('Login path:', chalk.magenta(answers.apppath));
            this.log('Install dependency:', chalk.magenta(answers.install));
            this.log('------------------------------');
            this.options.answers = answers;
        });
    }

    copy() {
        _scanner(this.templatePath(), this);
    }

    compile() {
        let thiz = this;
        lodash.each(MUSTACHE_CONF, (dest, src)=> {
            _compileMustache(src, dest, thiz);
        });
    }

    remove() {
        let thiz = this;
        let to = thiz.destinationPath();
        this.log('------------------------------');
        lodash.each(MUSTACHE_CONF, (dest, src)=> {
            fs.unlinkSync(path.join(to, src));
            thiz.log(`${chalk.green('Remove')} mustache file - ${src}`);
        });
        this.log('------------------------------');
    }

    install() {
        if (!this.options.answers.install) {
            return;
        }
        this.installDependencies();
    }

};
