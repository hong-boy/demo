'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');
const mkdirp = require('mkdirp');

/**
 * 匿名类
 * @Refs http://yeoman.io/authoring/user-interactions.html
 * @type {{new(*=, *=): {writing: (function())}}}
 */
module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this.log(yosay(`Welcome to use ${chalk.red('generator-tomato')}!`));
    }

    prompting() {
        return this.prompt([{
            type: 'input',
            name: 'name',
            message: 'Your project name',
            default: this.appname // Default to current folder name
        }, {
            type: 'confirm',
            name: 'install',
            message: 'Would you like to install dependency automaticlly?',
            default: false // Default to false
        }]).then((answers) => {
            this.log('------------------------------');
            this.log('app name:', chalk.magenta(answers.name));
            this.log('Install dependency:', chalk.magenta(answers.install));
            this.log('------------------------------');
            this.options.answers = answers;
        });
    }

    writing() {
        // Copy all files except '.sth'
        this.fs.copy(
            this.templatePath(),
            this.destinationPath()
        );

        // Copy .sth files
        this.fs.copy(
            this.templatePath('**/.*'),
            this.destinationPath()
        )
    }

    installDepnd() {
        if (!this.options.answers.install) {
            return;
        }
        this.installDependencies();
    }

};