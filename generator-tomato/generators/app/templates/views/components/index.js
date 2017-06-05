'use strict';
import fs from 'fs'
import path from 'path'

const dirname = __dirname;
const regx4vue = /\.+(vue)$/;
const COMPONENT = {};

/**
 * TODO - 待完成
 * @param dir
 * @param components
 */
function scanner(dir, components) {
    let list = fs.readdirSync(dir) || [];
    list.forEach((fileName)=> {
        let temp = path.join(dir, fileName);
        if (fs.lstateSync(temp).isDirectory()) {
            components[fileName] = {};
            scanner(temp, components[fileName]);
        } else if (regx4vue.test(fileName)) {
            let key = fileName.replace(regx4vue, '');
            //import foo from `${path.join(dir, fileName)}`;
            components[key] = foo;
        }
    });
}

//scanner(dirname, COMPONENT);

export default COMPONENT;