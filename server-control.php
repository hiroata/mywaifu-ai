<?php
// サーバー管理機能
// 各種コマンド定義
$commands = [
    'status' => 'pm2 status',
    'start' => 'pm2 start ecosystem.config.js',
    'restart' => 'pm2 restart ecosystem.config.js',
    'stop' => 'pm2 stop ecosystem.config.js', 
    'logs' => 'pm2 logs --lines 50',
    'reload' => 'pm2 reload ecosystem.config.js'
];

// アクションの判定
$action = isset($_GET['action']) ? $_GET['action'] : 'status';
$message = '';
$output = '';

// APIを呼び出さない通常のリクエスト処理
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($commands[$action])) {
        $output = shell_exec($commands[$action] . ' 2>&1');
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'output' => $output]);
    } else {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => '無効なコマンドです']);
    }
    exit;
}

// コマンド実行
if ($action === 'start') {
    $output = shell_exec($commands['start'] . ' 2>&1');
    $message = "サーバーを起動しました";
} 
elseif ($action === 'stop') {
    $output = shell_exec($commands['stop'] . ' 2>&1');
    $message = "サーバーを停止しました";
}
elseif ($action === 'restart') {
    $output = shell_exec($commands['restart'] . ' 2>&1');
    $message = "サーバーを再起動しました";
}
elseif ($action === 'status') {
    $output = shell_exec($commands['status'] . ' 2>&1');
    $message = "サーバーステータスを取得しました";
}
elseif ($action === 'logs') {
    $output = shell_exec($commands['logs'] . ' 2>&1');
    $message = "ログを取得しました";
}
else {
    $message = "利用可能なアクション: start, stop, restart, status, logs";
}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Node.jsサーバー管理</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #333;
            border-bottom: 1px solid #ddd;
            padding-bottom: 10px;
        }
        .status {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border-left: 4px solid #28a745;
        }
        .controls {
            margin: 20px 0;
        }
        .controls a {
            display: inline-block;
            margin-right: 10px;
            padding: 8px 15px;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }
        .start { background-color: #28a745; }
        .stop { background-color: #dc3545; }
        .restart { background-color: #ffc107; color: #333 !important; }
        .logs { background-color: #17a2b8; }
        .output {
            margin-top: 30px;
        }
        pre {
            background-color: #f8f9fa;
            padding: 15px;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
            border: 1px solid #ddd;
            border-radius: 4px;
            max-height: 500px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <h1>Node.jsサーバー管理</h1>
    
    <?php if ($message): ?>
    <div class="status">
        <?php echo htmlspecialchars($message); ?>
    </div>
    <?php endif; ?>
    
    <div class="controls">
        <a href="?action=start" class="start">起動</a>
        <a href="?action=stop" class="stop">停止</a>
        <a href="?action=restart" class="restart">再起動</a>
        <a href="?action=status" class="status">ステータス確認</a>
        <a href="?action=logs" class="logs">ログ表示</a>
    </div>
    
    <?php if ($output): ?>
    <div class="output">
        <h2><?php echo $action === 'logs' ? 'サーバーログ' : 'コマンド出力'; ?></h2>
        <pre><?php echo htmlspecialchars($output); ?></pre>
    </div>
    <?php endif; ?>
    
    <script>
        // タイマーで自動更新（ステータス表示時）
        <?php if ($action === 'status'): ?>
        setTimeout(() => {
            window.location.reload();
        }, 30000); // 30秒ごとに更新
        <?php endif; ?>
    </script>
</body>
</html>
