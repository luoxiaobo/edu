import mongoose from 'mongoose'

// 1. 连接 MongoDB 数据库
mongoose.connect('mongodb://localhost:27017/edu', {useNewUrlParser: true, useUnifiedTopology: true})

// 2. 设计集合结构（表结构）
const advertSchema = mongoose.Schema({
  title: {type: String, required: true},
  image: {type: String, required: true},
  link: {type: String, required: true},
  start_time: {type: Date, required: true},
  end_time: {type: Date, required: true},
  create_time: {type: Date, default: Date.now},
  last_modified: { type: Date, default: Date.now }
})

// 3. 将文档结构发布为模型
export default mongoose.model('Advert', advertSchema)