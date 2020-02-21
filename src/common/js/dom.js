//DOM操作的通用代码

export function addClass(el, className) {
    if (hasClass(el, className)) {
        return
    }
    let newClass = el.className.split(' ')
    newClass.push(className)
    el.className = newClass.join(' ')
}

export function hasClass(el, className) {
    let reg = new RegExp('(^|\\s)' + className + '(\\s|$)') //因为这里是字符串，为了使用空白字符本身的意义，而使用转义字符。
    return reg.test(el.className)
}

//常用的js设计思路，get、set
export function getData(el, name, val) {
    const prefix = 'data-'
    name = prefix + name
    if (val) {
        return el.setAttribute(name, val)
    } else {
        return el.getAttribute(name)
    }
}

//自动添加前缀

let elementStyle = document.createElement('div').style

//会根据浏览器自动匹配前缀
let vendor = (() => {
    let transformNames = {
        webkit: 'webkitTransform',
        Moz: 'MozTransform',
        O: 'OTransform',
        ms: 'msTransform',
        standard: 'transform'
    }

    for (let key in transformNames) {
        if (elementStyle[transformNames[key]] !== undefined) {
            //transformNames[key]代表键值，拿所有div中都有的属性来做比较
            //css 有预处理兼容问题，但js动态添加的并没有 所以需要这个函数
            return key
        }
    }

    return false
})()

export function prefixStyle(style) {
    if (vendor === false) {
        return false
    }

    if (vendor === 'standard') {
        return style
    }

    return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
