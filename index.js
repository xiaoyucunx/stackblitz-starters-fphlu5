import express, { json, urlencoded } from 'express';
import { completions, chatCompletions } from './routes.js';
import { corsMiddleware, rateLimitMiddleware } from './middlewares.js';
import { DEBUG, SERVER_PORT } from './config.js';
import { createProxyMiddleware } from 'http-proxy-middleware';

let app = express();

process.on('uncaughtException', function (err) {
  if (DEBUG) console.error(`Caught exception: ${err}`);
});

// Middlewares
app.use(corsMiddleware);
app.use(rateLimitMiddleware);
app.use(json());
app.use(urlencoded({ extended: true }));

// Register routes
app.all('/', async function (req, res) {
  res.set('Content-Type', 'application/json');
  return res.status(200).send({
    status: true,
    github: 'https://github.com/PawanOsman/ChatGPT',
    discord: 'https://discord.pawan.krd',
  });
});
app.post('/v1/completions', completions);
app.post('/v1/chat/completions', chatCompletions);

// 创建代理中间件，将所有请求转发到指定网站
const proxyMiddleware = createProxyMiddleware({
  target: 'https://api.openai.com', // 更改为您想要转发到的网站
  changeOrigin: true,
  // 其他选项可以根据需要进行配置
});

// 使用代理中间件
app.use('*', proxyMiddleware);

// Start server
app.listen(SERVER_PORT, () => {
  console.log(`Listening on ${SERVER_PORT} ...`);
});
