/**
 * 主应用入口
 * 
 * 这个文件是整个应用的启动入口，
 * 负责初始化应用并启动服务器。
 * 
 * 主要功能：
 * - 创建 Express 应用实例
 * - 加载中间件和路由
 * - 启动 HTTP 服务器
 * 
 * 什么时候会用到：
 * - 运行 npm start 时启动应用
 * - 部署到服务器时作为入口文件
 */

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// 加载路由
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');

app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
