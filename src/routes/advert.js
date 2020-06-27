import express from 'express'
import Advert from '../models/adverts'
import formidable from 'formidable'
import config from '../config'
import { basename } from 'path'

// 创建一个路由容器，把所有的路由中间件挂载到路由容器
const router = express.Router()

router.get('/advert', (req, res, next) => {
  const page = Number.parseInt(req.query.page, 10)
  const pageSize = 5
  Advert
    .find()
    .skip((page -1) * pageSize)
    .limit(pageSize)
    .exec((err, adverts) => {
      if (err) {
        return next(err)
      }
      Advert.estimatedDocumentCount((err, count) => {
        if (err) {
          return next(err)
        }
        const totalPage = Math.ceil(count / pageSize)  // 总页码 = 总记录数 / 每页显示大小
        res.render('advert_list.html', { adverts, totalPage, page })
      })     
    })
})

router.get('/advert/add', (req, res, next) => {
  res.render('advert_add.html')
})

/*
router.post('/advert/add', (req, res, next) => {
  // 1. 接收表单提交的数据
  // 同一个请求的 req 和 res 是同一个对象
  // const body = req.body

  const form = formidable({ multiples: true })
  form.uploadDir = config.uploadDir  // 配置 formidable 文件上传接收路径
  form.keepExtensions = true // 配置保持文件原始的扩展名

  // fields 就是接收到的表单中的普通数据字段
  // flies 就是表单中文件上传上来的一些文件信息，例如文件大小，上传上来的文件路径 
  form.parse(req, (err, fields, files) => {
    if (err) {
      return next(err)
    }
    const body = fields
    body.image = basename(files.image.path)
   
    // 2. 操作数据库
    const advert = new Advert({
      title: body.title,
      image: body.image,
      link: body.link,
      start_time: body.start_time,
      end_time: body.end_time
    })

    advert.save((err, ret) => {
      if (err) {
        return next(err)
      } 
      res.json({
        err_code: 0
      })
    })
  })
  
})
*/

// 使用 promise 的形式来写
router.post('/advert/add', (req, res, next) => {
  pmFormidable(req)
    .then((result) => {
      const [fields, files] = result
      const body = fields
      body.image = basename(files.image.path)
   
      // 2. 操作数据库
      const advert = new Advert({
        title: body.title,
        image: body.image,
        link: body.link,
        start_time: body.start_time,
        end_time: body.end_time
      })
      return advert.save()
    })
    .then(result => {
      res.json({
        err_code: 0
      })
    })
    .catch(err => {
      next(err)
    })

    function pmFormidable(req) {
      return new Promise((resolve, reject) => {
        const form = formidable({ multiples: true })
        form.uploadDir = config.uploadDir  // 配置 formidable 文件上传接收路径
        form.keepExtensions = true // 配置保持文件原始的扩展名
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject(err)
          }
          resolve([fields, files])
        })
      })
    }
})


router.get('/advert/list', (req, res, next) => {
  Advert.find((err, docs) => {
    if (err) {
      return next(err)
    }
    res.json({
      err_code: 0,
      result: docs
    })
  })
})

// /advert/one/:advertId 是一个模糊匹配路径
// 可以匹配 /advert/one/* 的路径形式
// 例如：/advert/one/1 /advert/one/2 /advert/one/a /advert/one/abc 等路径
// 但是 /advert/one 或者 /advert/one/a/b 是不行的
// 至于 advertId 是自己起的一个名字，可以在处理函数中通过 req.params 来进行获取
router.get('/advert/one/:advertId', (req, res, next) => {
  Advert.findById(req.params.advertID, (err, result) => {
    if (err) {
      return next(err)
    }
    res.json({
      err_code: 0,
      result: result
    })
  })
})

router.post('/advert/edit', (req, res, next) => {
  Advert.findById(req.body.id, (err, advert) => {
    if (err) {
      return next(err)
    }
    const body = req.body
    advert.title = body.title
    advert.image = body.image
    advert.link = body.link
    advert.start_time = body.start_time
    advert.end_time = body.end_time
    advert.last_modified = Date.now()
    
    // 这里的 save 因为内部有一个 _id 所以这里是不会新增数据的，而是更新已有的数据
    advert.save((err, result) => {
      if (err) {
        return next(err) 
      }
      res.json({
        err_code: 0
      })
    })
  })
})

router.get('/advert/remove/:advertId', (req, res, next) => {
  Advert.remove({_id: req.params.advertId}, err => {
    if (err) {
      return next(err)
    }
    res.json({
      err_code: 0
    })
  })
})

export default router
