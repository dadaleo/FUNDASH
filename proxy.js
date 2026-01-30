const http = require('http');
const https = require('https');

// 适配云端环境：优先读取系统分配的端口，本地默认为 3000
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    // 设置跨域请求头，允许您的 GitHub Pages 域名访问
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 处理预检请求 (Preflight)
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 过滤无效请求
    if (req.url === '/favicon.ico') {
        res.writeHead(404);
        res.end();
        return;
    }

    // 将前端请求转发至腾讯财经接口
    const targetUrl = `https://qt.gtimg.cn${req.url}`;
    
    https.get(targetUrl, (proxyRes) => {
        let chunks = [];
        proxyRes.on('data', (chunk) => chunks.push(chunk));
        proxyRes.on('end', () => {
            // 合并数据块
            const buffer = Buffer.concat(chunks);
            // 保持 GBK 编码返回，由网页端的 TextDecoder 处理乱码
            res.writeHead(200, { 
                'Content-Type': 'text/plain; charset=gbk',
                'Cache-Control': 'no-cache'
            });
            res.end(buffer);
        });
    }).on('error', (err) => {
        console.error("抓取失败:", err.message);
        res.writeHead(500);
        res.end("Internal Server Error");
    });

});

// 监听 0.0.0.0 以确保云服务器可以接受外部连接
server.listen(PORT, '0.0.0.0', () => {
    console.log(`-----------------------------------------`);
    console.log(`✅ 代理服务器运行中`);
    console.log(`📍 端口: ${PORT}`);
    console.log(`🚀 适配环境: 本地 & 云端 (Render/Railway)`);
    console.log(`-----------------------------------------`);
});