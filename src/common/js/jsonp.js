import originJsonp from 'jsonp'

//根据jsonp的库来封装promise对象
export default function jsonp(url, data, Option) {
    url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
    return new Promise((resolve, reject) => {
        //调用库中的函数
        originJsonp(url, Option, (err, data) => {
            if (!err) {
                resolve(data)
            } else {
                reject(err)
            }
        })
    })
}

//将data拼在URL上
function param(data) {
    let url = ''
    for (var k in data) {
        let value = data[k] !== undefined ? data[k] : ''
        url += `&${k}=${encodeURIComponent(value)}`
    }
    //因为是拼接，所以需要考虑&的去留问题
    return url ? url.substring(1) : ''
}
