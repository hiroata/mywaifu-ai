// Node.jsサーバー起動スクリプト（WebSocket対応）
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

// グローバルエラーハンドラー
process.on('uncaughtException', (error) => {
  console.error('未処理の例外:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未処理のPromise拒否:', reason);
  console.error('Promise:', promise);
  process.exit(1);
});

console.log('🚀 MyWaifuAI サーバー起動中...');
console.log('環境変数チェック:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT SET');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL);
console.log('Port:', port);

// Next.jsアプリケーションを初期化
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  console.log('Next.jsアプリケーションの準備が完了しました');
  
  // HTTPサーバーを作成
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  // Socket.IOを初期化（Render対応設定）
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? [process.env.NEXTAUTH_URL, process.env.RENDER_EXTERNAL_URL]
        : ["http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // WebSocket接続の処理
  io.on('connection', (socket) => {
    console.log('新しいクライアントが接続しました:', socket.id);

    // チャットルームに参加
    socket.on('join-chat', (chatId) => {
      socket.join(`chat-${chatId}`);
      console.log(`クライアント ${socket.id} がチャット ${chatId} に参加しました`);
    });

    // メッセージの送信
    socket.on('send-message', (data) => {
      const { chatId, message, userId } = data;
      
      // 同じチャットルームの他のクライアントにメッセージを送信
      socket.to(`chat-${chatId}`).emit('receive-message', {
        id: Date.now().toString(),
        content: message,
        userId,
        timestamp: new Date().toISOString(),
        isBot: false
      });
    });

    // タイピング状態の通知
    socket.on('typing', (data) => {
      const { chatId, userId, isTyping } = data;
      socket.to(`chat-${chatId}`).emit('user-typing', { userId, isTyping });
    });

    // 接続解除
    socket.on('disconnect', (reason) => {
      console.log(`クライアントが切断しました: ${socket.id}, 理由: ${reason}`);
    });

    // エラーハンドリング
    socket.on('error', (error) => {
      console.error('Socket.IO エラー:', error);
    });
  });
  // サーバーを起動
  server.listen(port, (err) => {
    if (err) {
      console.error('サーバー起動エラー:', err);
      throw err;
    }
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server is running`);
    console.log(`> Environment: ${process.env.NODE_ENV}`);
  });
}).catch((error) => {
  console.error('Next.jsアプリケーション準備エラー:', error);
  process.exit(1);
});
