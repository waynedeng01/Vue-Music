function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

//经典洗牌算法
export function shuffle(arr) {
    let _arr = arr.slice() // 拷贝一个副本，防止原数组变化
    for (let i = 0; i < _arr.length; i++) {
        let j = getRandomInt(0, i)
        let t = _arr[i]
        _arr[i] = _arr[j]
        _arr[j] = t
    }
    return _arr
}

// 函数节流

export function debounce(func, delay) {
    let timer
    return function (...args) { //  去拿到调用它函数的参数，即执行外部函数的时候返回一个新函数，并通过新函数去延迟
        if (timer) {
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            func.apply(this, args) // 在延迟的函数中调用之前的函数，并把this和参数拼上去
            // console.log(args)
        }, delay)
    }
}