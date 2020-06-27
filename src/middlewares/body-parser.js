import queryString from 'querystring'  // querystring 是一个核心模块

// 利用中间件解析表单 POST 请求

export default (req, res, next) => {
  // req.headers 可以拿到当前请求的请求报文头信息
  // POST 方法请求时，头部对象 req.headers 内会包含 content-length 属性
  // 当请求方法为 GET 时，req.headers 内不会包含 content-length 属性
  // 所以我们可以利用该属性来判断请求方法是 GET 还是 POST
  
  // if (!req.headers['content-length']) {
  //   // 说明请求方法为 GET
  //   return next()
  // }

  if (req.method.toLowerCase() === 'get') {
    return next()
  }

  // 如果是普通表单 post，则咱们自己处理
  // 如果是有文件的表单 post，则咱们不处理
  if(req.headers['content-type'].startsWith('multipart/form-data')) {
    return next()
  }

  let data =''
  // ​在node中允许传递大容量的参数，如果传递的参数较大，那么它支持分批接收参数
  // 在接收参数的时候，会持续的触发data事件
  // data事件中有一个回调函数，这个函数的参数就是每次接收到的字符串
  // 因此这是一个异步的操作
  req.on('data', chunk => {
    data += chunk
  })
  // 如果参数接收完毕，会自动的触发end事件
  req.on('end', () => {
    // console.log(data) // foo=bar&a=b&c=d
    // queryString.parse() 方法将字符串转成对象，说白了其实就是把url上带的参数串转成数组对象
    req.body = queryString.parse(data) 
    // console.log(req.body) // { foo: 'bar', a: 'b', c: 'd' }
    next()
  })
}