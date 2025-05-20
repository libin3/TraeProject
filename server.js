const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

// 请求响应日志中间件
app.use((req, res, next) => {
  const oldJson = res.json;
  res.json = (body) => {
    console.log('请求:', {
      method: req.method,
      path: req.path,
      body: req.body
    });
    console.log('响应:', {
      status: res.statusCode,
      body: body
    });
    return oldJson.call(res, body);
  };
  next();
});
// 将静态文件中间件移到路由之后
app.use(express.static(__dirname));  // 移动这行到路由定义之后

// 生活教练对话接口
app.post('/api/chat', async (req, res) => {
  try {
    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-r1-250120",
        messages: req.body.messages,
        stream: true,
        temperature: 0.6
      }),
      timeout: 60000
    });

    res.set('Content-Type', 'text/event-stream');
    response.body.pipe(res);
  } catch (error) {
    console.error('API请求失败:', error);
    res.status(500).json({ error: '服务器通信异常' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});