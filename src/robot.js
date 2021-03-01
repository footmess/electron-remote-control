const { ipcMain } = require("electron");
const robot = require('robotjs');
const vkey = require('vkey');
/**
 * 处理鼠标事件
 * data {clientX,clientY,screen:{width,height},video:{width,height}}
 */
function handleMouseEvent(data) {
    const {clientX,clientY,video,screen} = data;
    // 等比例定位鼠标位置
    const x = clientX * screen.width / video.width;
    const y = clientY * screen.height / video.height;
    robot.moveMouse(x,y);
    robot.mouseClick();
}

/**
 * 处理键盘事件
 * data {keyCode,meta,alt,ctrl,shift}
 */
function handleKeyEvent(data) {
    // 是否有修饰键
    const modifiers = [];
    if(data.meta) modifiers.push('meta');
    if(data.alt) modifiers.push('alt');
    if(data.ctrl) modifiers.push('ctrl');
    if(data.shift) modifiers.push('shift');
    // TODO 一些特殊的按键需要处理，比如space，enter，delete等
    const key = vkey[data.keyCode].toLowerCase();
    console.log({key,natureKey:data.key});
    // 通过第一个字符判断是否是组合按键 比如：shift + a
    if (key[0] !== '<') {
        robot.keyTap(key,modifiers);
    }
}

module.exports = function() {
    ipcMain.on('robot',(e,type,data) => {
        if(type==='mouse') {
            handleMouseEvent(data);
        }else if(type === 'key') {
            handleKeyEvent(data);
        }
    })
}